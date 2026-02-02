import { Injectable, OnModuleInit, Logger, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GoogleGenerativeAI, GenerativeModel, Schema } from '@google/generative-ai'

interface KeyUsageStats {
  apiKey: string
  minuteRequests: number[]
  dailyRequests: number[]
  lastUsed: number
  isDisabled: boolean
  disabledUntil: number | null
  consecutiveFailures: number
}

export interface GeminiGenerationConfig {
  responseMimeType?: string
  responseSchema?: Schema
}

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name)
  private keyStats: Map<string, KeyUsageStats> = new Map()
  private keys: string[] = []

  private rateLimitPerMinute: number = 15
  private rateLimitPerDay: number = 1500
  private readonly MINUTE_MS = 60 * 1000
  private readonly DAY_MS = 24 * 60 * 60 * 1000
  private readonly MAX_RETRIES = 3
  private readonly BACKOFF_BASE_MS = 1000

  constructor(private readonly configService: ConfigService) {}

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

    this.rateLimitPerMinute = this.configService.get<number>('GEMINI_RATE_LIMIT_PER_MINUTE') ?? 15
    this.rateLimitPerDay = this.configService.get<number>('GEMINI_RATE_LIMIT_PER_DAY') ?? 1500

    for (const key of this.keys) {
      this.keyStats.set(key, {
        apiKey: key,
        minuteRequests: [],
        dailyRequests: [],
        lastUsed: 0,
        isDisabled: false,
        disabledUntil: null,
        consecutiveFailures: 0,
      })
    }

    this.logger.log(`Gemini 서비스 초기화 완료: ${this.keys.length}개 키 등록`)
  }

  async execute<T>(
    executor: (model: GenerativeModel) => Promise<T>,
    modelName: string = 'gemini-3-flash-preview',
    generationConfig?: GeminiGenerationConfig,
  ): Promise<T> {
    const triedKeys = new Set<string>()
    let lastError: Error | null = null

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      const apiKey = this.getBestAvailableKey(triedKeys)

      if (!apiKey) {
        this.logger.warn('사용 가능한 API 키가 없습니다.')
        break
      }

      triedKeys.add(apiKey)
      const stats = this.keyStats.get(apiKey)!

      try {
        this.recordUsage(apiKey)

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig,
        })

        const result = await executor(model)

        stats.consecutiveFailures = 0

        return result
      } catch (error) {
        lastError = error as Error
        stats.consecutiveFailures++

        const errorType = this.classifyError(error)
        this.logger.warn(`Gemini API 호출 실패 (시도 ${attempt + 1}/${this.MAX_RETRIES}, 키: ${apiKey.substring(0, 8)}...): ${errorType}`)

        this.handleKeyFailure(apiKey, errorType)

        if (attempt < this.MAX_RETRIES - 1) {
          const backoffMs = this.BACKOFF_BASE_MS * Math.pow(2, attempt)
          await this.sleep(backoffMs)
        }
      }
    }

    throw lastError ?? new InternalServerErrorException('Gemini API 호출에 실패했습니다.')
  }

  private getBestAvailableKey(excludeKeys: Set<string> = new Set()): string | null {
    const now = Date.now()
    let bestKey: string | null = null
    let maxAvailability = -1

    for (const [key, stats] of this.keyStats.entries()) {
      if (excludeKeys.has(key)) continue

      if (stats.isDisabled) {
        if (stats.disabledUntil && now > stats.disabledUntil) {
          stats.isDisabled = false
          stats.disabledUntil = null
          stats.consecutiveFailures = 0
        } else {
          continue
        }
      }

      this.cleanupOldRequests(stats, now)

      const minuteAvailable = this.rateLimitPerMinute - stats.minuteRequests.length
      const dailyAvailable = this.rateLimitPerDay - stats.dailyRequests.length

      if (minuteAvailable <= 0 || dailyAvailable <= 0) {
        continue
      }

      const availability = minuteAvailable * (1 - stats.consecutiveFailures * 0.1)

      if (availability > maxAvailability) {
        maxAvailability = availability
        bestKey = key
      }
    }

    return bestKey
  }

  private recordUsage(apiKey: string): void {
    const stats = this.keyStats.get(apiKey)
    if (!stats) return

    const now = Date.now()
    stats.minuteRequests.push(now)
    stats.dailyRequests.push(now)
    stats.lastUsed = now
  }

  private handleKeyFailure(apiKey: string, errorType: string): void {
    const stats = this.keyStats.get(apiKey)
    if (!stats) return

    let disableDuration: number

    switch (errorType) {
      case 'RATE_LIMIT':
        disableDuration = this.MINUTE_MS
        break
      case 'QUOTA_EXCEEDED':
        disableDuration = this.DAY_MS
        break
      case 'AUTH_ERROR':
        disableDuration = this.DAY_MS
        break
      default:
        disableDuration = 5 * this.MINUTE_MS
    }

    if (stats.consecutiveFailures >= 3) {
      stats.isDisabled = true
      stats.disabledUntil = Date.now() + disableDuration
      this.logger.warn(`API 키 비활성화: ${apiKey.substring(0, 8)}... (${errorType})`)
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

  private cleanupOldRequests(stats: KeyUsageStats, now: number): void {
    const minuteAgo = now - this.MINUTE_MS
    const dayAgo = now - this.DAY_MS

    stats.minuteRequests = stats.minuteRequests.filter(ts => ts > minuteAgo)
    stats.dailyRequests = stats.dailyRequests.filter(ts => ts > dayAgo)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  getHealthStatus(): {
    totalKeys: number
    activeKeys: number
    keyStatuses: Array<{
      keyPrefix: string
      minuteUsage: number
      dailyUsage: number
      isDisabled: boolean
      consecutiveFailures: number
    }>
  } {
    const now = Date.now()
    const keyStatuses = Array.from(this.keyStats.entries()).map(([key, stats]) => {
      this.cleanupOldRequests(stats, now)
      return {
        keyPrefix: key.substring(0, 8) + '...',
        minuteUsage: stats.minuteRequests.length,
        dailyUsage: stats.dailyRequests.length,
        isDisabled: stats.isDisabled,
        consecutiveFailures: stats.consecutiveFailures,
      }
    })

    return {
      totalKeys: this.keys.length,
      activeKeys: keyStatuses.filter(s => !s.isDisabled).length,
      keyStatuses,
    }
  }
}
