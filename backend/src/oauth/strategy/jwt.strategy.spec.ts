import { UnauthorizedException } from '@nestjs/common'
import { JwtStrategy } from './jwt.strategy'
import type { ConfigService } from '@nestjs/config'

interface JwtPayload {
  sub: string
  iat?: number
  exp?: number
}

describe('JwtStrategy', () => {
  let strategy: JwtStrategy

  beforeEach(() => {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
      get: jest.fn(),
    } as unknown as ConfigService
    strategy = new JwtStrategy(configService)
  })

  describe('validate', () => {
    it('유효한 payload에서 id를 반환한다', () => {
      const result = strategy.validate({ sub: 'user-1' })
      expect(result).toEqual({ id: 'user-1' })
    })

    it('sub가 없으면 UnauthorizedException을 던진다', () => {
      expect(() => strategy.validate({ sub: '' })).toThrow(UnauthorizedException)
    })

    it('payload가 null이면 UnauthorizedException을 던진다', () => {
      expect(() => strategy.validate(null as unknown as JwtPayload)).toThrow(UnauthorizedException)
    })
  })
})
