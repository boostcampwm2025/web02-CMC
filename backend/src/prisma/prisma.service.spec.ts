/* eslint-disable @typescript-eslint/unbound-method */
import { UnauthorizedException } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import type { ConfigService } from '@nestjs/config'

jest.mock('generated/prisma/client', () => ({
  PrismaClient: class MockPrismaClient {
    constructor() {}
    $connect = jest.fn().mockResolvedValue(undefined)
    $disconnect = jest.fn().mockResolvedValue(undefined)
  },
}))

jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: class MockPrismaPg {
    constructor() {}
  },
}))

describe('PrismaService', () => {
  const createMockConfigService = (dbUrl: string | undefined): jest.Mocked<ConfigService> =>
    ({
      get: jest.fn((key: string) => {
        if (key === 'DATABASE_URL') return dbUrl
        return undefined
      }),
    }) as unknown as jest.Mocked<ConfigService>

  describe('constructor', () => {
    it('DATABASE_URL이 없으면 UnauthorizedException을 던진다', () => {
      const configService = createMockConfigService(undefined)

      expect(() => new PrismaService(configService)).toThrow(UnauthorizedException)
      expect(() => new PrismaService(configService)).toThrow('유효하지 않은 DB_URL입니다.')
    })

    it('DATABASE_URL이 있으면 정상적으로 생성된다', () => {
      const configService = createMockConfigService('postgresql://localhost:5432/test')

      const service = new PrismaService(configService)

      expect(service).toBeDefined()
    })
  })

  describe('onModuleInit', () => {
    it('$connect를 호출한다', async () => {
      const configService = createMockConfigService('postgresql://localhost:5432/test')
      const service = new PrismaService(configService)

      await service.onModuleInit()

      expect(service.$connect).toHaveBeenCalled()
    })
  })

  describe('enableShutdownHooks', () => {
    it('$disconnect를 호출한다', async () => {
      const configService = createMockConfigService('postgresql://localhost:5432/test')
      const service = new PrismaService(configService)

      await service.enableShutdownHooks()

      expect(service.$disconnect).toHaveBeenCalled()
    })
  })
})
