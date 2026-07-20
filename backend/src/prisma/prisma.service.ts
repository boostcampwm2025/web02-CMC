import { Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common'
import { PrismaClient } from 'generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { ConfigService } from '@nestjs/config'

const DATABASE_CONNECT_TIMEOUT_MS = 2000
const DATABASE_QUERY_TIMEOUT_MS = 10000

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name)

  constructor(configService: ConfigService) {
    const DATABASE_URL = configService.get<string>('DATABASE_URL')

    if (!DATABASE_URL) {
      throw new UnauthorizedException('유효하지 않은 DB_URL입니다.')
    }

    const adapter = new PrismaPg({
      connectionString: DATABASE_URL,
      connectionTimeoutMillis: DATABASE_CONNECT_TIMEOUT_MS,
      query_timeout: DATABASE_QUERY_TIMEOUT_MS,
    })

    super({ adapter })
  }

  async onModuleInit() {
    try {
      await this.$connect()
    } catch (error) {
      const stack = error instanceof Error ? error.stack : undefined
      this.logger.error('Initial database connection failed; readiness checks will retry.', stack)
    }
  }

  async ping(): Promise<void> {
    await this.$queryRaw`SELECT 1`
  }

  async enableShutdownHooks() {
    await this.$disconnect()
  }
}
