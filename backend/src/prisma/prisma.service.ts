import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common'
import { PrismaClient } from 'generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(configService: ConfigService) {
    const DATABASE_URL = configService.get<string>('DATABASE_URL')

    if (!DATABASE_URL) {
      throw new UnauthorizedException('유효하지 않은 DB_URL입니다.')
    }

    const adapter = new PrismaPg({
      connectionString: DATABASE_URL,
    })

    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async enableShutdownHooks() {
    await this.$disconnect()
  }
}
