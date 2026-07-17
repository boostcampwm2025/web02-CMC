import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RedisHealthRepository } from '../redis/redis-health.repository'

const READINESS_TIMEOUT_MS = 2000

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name)

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisRepository: RedisHealthRepository,
  ) {}

  getLiveness() {
    return { status: 'alive' as const }
  }

  async getReadiness() {
    const checks = [
      { name: 'database', operation: this.prismaService.ping() },
      { name: 'redis', operation: this.redisRepository.ping() },
    ]
    const results = await Promise.allSettled(checks.map(check => this.withTimeout(check.operation)))
    const failedChecks = results.flatMap((result, index) => (result.status === 'rejected' ? [checks[index].name] : []))

    if (failedChecks.length > 0) {
      this.logger.warn(`Readiness check failed: ${failedChecks.join(', ')}`)
      throw new ServiceUnavailableException('Service dependencies are unavailable')
    }

    return { status: 'ready' as const }
  }

  private async withTimeout<T>(operation: Promise<T>): Promise<T> {
    let timeout: ReturnType<typeof setTimeout> | undefined

    try {
      return await Promise.race([
        operation,
        new Promise<never>((_, reject) => {
          timeout = setTimeout(() => reject(new Error('Readiness check timed out')), READINESS_TIMEOUT_MS)
        }),
      ])
    } finally {
      if (timeout) clearTimeout(timeout)
    }
  }
}
