import { Injectable, OnModuleInit, Logger, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GoogleGenerativeAI, GenerativeModel, Schema } from '@google/generative-ai'
import { RedisRepository } from '../redis/redis.repository'

export interface GeminiGenerationConfig {
  responseMimeType?: string
  responseSchema?: Schema
}

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name)
  private keys: string[] = []

  private rateLimitPerMinute: number = 5
  private rateLimitPerDay: number = 20
  private readonly BACKOFF_BASE_MS = 1000

  constructor(
    private readonly configService: ConfigService,
    private readonly redisRepository: RedisRepository,
  ) {}

  onModuleInit() {
    const keysString = this.configService.get<string>('GEMINI_API_KEYS')

    if (!keysString) {
      throw new Error('GEMINI_API_KEYS 환경변수가 필요합니다.')
    }

    this.keys = keysString
      .split(',')
      .map(k => k.trim())
      .filter(Boolean)

    if (this.keys.length === 0) {
      throw new Error('GEMINI_API_KEYS에 유효한 키가 없습니다.')
    }

    this.rateLimitPerMinute = this.configService.get<number>('GEMINI_RATE_LIMIT_PER_MINUTE') ?? 5
    this.rateLimitPerDay = this.configService.get<number>('GEMINI_RATE_LIMIT_PER_DAY') ?? 20

    this.logger.log(`Gemini 서비스 초기화 완료: ${this.keys.length}개 키 등록`)
  }

  async execute<T>(
    executor: (model: GenerativeModel) => Promise<T>,
    modelName: string = 'gemini-3-flash-preview',
    generationConfig?: GeminiGenerationConfig,
  ): Promise<T> {
    const triedKeys = new Set<string>()
    let lastError: Error | null = null

    const maxAttempts = this.keys.length

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const apiKey = await this.getBestAvailableKey(triedKeys)

      if (!apiKey) {
        this.logger.warn('사용 가능한 API 키가 없습니다.')
        break
      }

      triedKeys.add(apiKey)

      try {
        await this.recordUsage(apiKey)

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig,
        })

        const result = await executor(model)

        await this.redisRepository.del(`gemini:failures:${apiKey}`)

        this.logger.debug(`[Gemini] success key=${apiKey.substring(6, 14)}... model=${modelName}`)

        return result
      } catch (error) {
        lastError = error as Error

        const errorType = this.classifyError(error)
        this.logger.warn(`Gemini API 호출 실패 (시도 ${attempt + 1}/${maxAttempts}, 키: ${apiKey.substring(6, 14)}...): ${errorType}`)

        await this.handleKeyFailure(apiKey, errorType)

        if (attempt < maxAttempts - 1) {
          const backoffMs = this.BACKOFF_BASE_MS * Math.pow(2, attempt)
          await this.sleep(backoffMs)
        }
      }
    }

    throw lastError ?? new InternalServerErrorException('Gemini API 호출에 실패했습니다.')
  }

  private static readonly METRICS_PER_KEY = 4
  private static readonly MetricIdx = {
    DISABLED: 0,
    FAILURES: 1,
    MIN_USAGE: 2,
    DAY_USAGE: 3,
  } as const

  private async getBestAvailableKey(excludeKeys: Set<string> = new Set()): Promise<string | null> {
    const redis = this.redisRepository.getRedisClient()
    const pipeline = redis.pipeline()

    const availableKeys = this.keys.filter(k => !excludeKeys.has(k))

    for (const key of availableKeys) {
      pipeline.exists(`gemini:disabled:${key}`)
      pipeline.get(`gemini:failures:${key}`)
      pipeline.get(`gemini:usage:min:${key}`)
      pipeline.get(`gemini:usage:day:${key}`)
    }

    const results = await pipeline.exec()
    if (!results) return null

    let bestKey: string | null = null
    let maxAvailability = -1

    for (let i = 0; i < availableKeys.length; i++) {
      const key = availableKeys[i]
      const base = i * GeminiService.METRICS_PER_KEY

      const isDisabled = results[base + GeminiService.MetricIdx.DISABLED]?.[1] === 1
      const consecutiveFailures = Number(results[base + GeminiService.MetricIdx.FAILURES]?.[1] ?? 0)
      const minUsage = Number(results[base + GeminiService.MetricIdx.MIN_USAGE]?.[1] ?? 0)
      const dayUsage = Number(results[base + GeminiService.MetricIdx.DAY_USAGE]?.[1] ?? 0)

      if (isDisabled) continue

      const minuteAvailable = this.rateLimitPerMinute - minUsage
      const dailyAvailable = this.rateLimitPerDay - dayUsage

      if (minuteAvailable <= 0 || dailyAvailable <= 0) continue

      const failureWeight = Math.max(0, 1 - consecutiveFailures * 0.1)
      const availability = minuteAvailable * failureWeight

      this.logger.debug(
        `[GeminiKeyPick] ${key.substring(6, 14)}... disabled=${isDisabled} min=${minUsage}/${this.rateLimitPerMinute} day=${dayUsage}/${this.rateLimitPerDay} failures=${consecutiveFailures} avail=${availability.toFixed(2)}`,
      )

      if (availability > maxAvailability) {
        maxAvailability = availability
        bestKey = key
      }
    }
    return bestKey
  }

  private async recordUsage(apiKey: string): Promise<void> {
    const minKey = `gemini:usage:min:${apiKey}`
    const dayKey = `gemini:usage:day:${apiKey}`

    await Promise.all([this.redisRepository.incr(minKey, 60), this.redisRepository.incr(dayKey, 86400)])
  }

  private async handleKeyFailure(apiKey: string, errorType: string): Promise<void> {
    const failureKey = `gemini:failures:${apiKey}`
    const disabledKey = `gemini:disabled:${apiKey}`

    const consecutiveFailures = await this.redisRepository.incr(failureKey, 86400)

    let disableDuration: number
    switch (errorType) {
      case 'RATE_LIMIT':
        disableDuration = 60
        break
      case 'QUOTA_EXCEEDED':
      case 'AUTH_ERROR':
        disableDuration = 86400
        break
      default:
        disableDuration = 300
    }

    if (consecutiveFailures >= 3) {
      await this.redisRepository.set(disabledKey, 'true', disableDuration)
      this.logger.warn(`API 키 비활성화: ${apiKey.substring(6, 14)}... (${errorType}, 연속 실패: ${consecutiveFailures})`)
    }
  }

  private classifyError(error: unknown): string {
    if (!(error instanceof Error)) return 'UNKNOWN'

    const message = error.message.toLowerCase()

    if (message.includes('429') || message.includes('resource_exhausted')) {
      return 'RATE_LIMIT'
    }
    if (message.includes('quota')) {
      return 'QUOTA_EXCEEDED'
    }
    if (message.includes('401') || message.includes('403') || message.includes('unauthenticated')) {
      return 'AUTH_ERROR'
    }
    if (message.includes('timeout') || message.includes('econnreset')) {
      return 'NETWORK_ERROR'
    }

    return 'UNKNOWN'
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getHealthStatus(): Promise<{
    totalKeys: number
    activeKeys: number
    keyStatuses: Array<{
      keyPrefix: string
      minuteUsage: number
      dailyUsage: number
      isDisabled: boolean
      consecutiveFailures: number
    }>
  }> {
    const redis = this.redisRepository.getRedisClient()
    const pipeline = redis.pipeline()

    for (const key of this.keys) {
      pipeline.exists(`gemini:disabled:${key}`)
      pipeline.get(`gemini:failures:${key}`)
      pipeline.get(`gemini:usage:min:${key}`)
      pipeline.get(`gemini:usage:day:${key}`)
    }

    const results = await pipeline.exec()
    if (!results) {
      return { totalKeys: this.keys.length, activeKeys: 0, keyStatuses: [] }
    }

    const keyStatuses = this.keys.map((key, i) => {
      const base = i * GeminiService.METRICS_PER_KEY
      return {
        keyPrefix: key.substring(6, 14) + '...',
        isDisabled: results[base + GeminiService.MetricIdx.DISABLED]?.[1] === 1,
        consecutiveFailures: Number(results[base + GeminiService.MetricIdx.FAILURES]?.[1] ?? 0),
        minuteUsage: Number(results[base + GeminiService.MetricIdx.MIN_USAGE]?.[1] ?? 0),
        dailyUsage: Number(results[base + GeminiService.MetricIdx.DAY_USAGE]?.[1] ?? 0),
      }
    })

    return {
      totalKeys: this.keys.length,
      activeKeys: keyStatuses.filter(s => !s.isDisabled).length,
      keyStatuses,
    }
  }
}
