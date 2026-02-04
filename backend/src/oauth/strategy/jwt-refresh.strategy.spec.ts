import type { Request } from 'express'
import { UnauthorizedException } from '@nestjs/common'
import { RefreshStrategy } from './jwt-refresh.strategy'
import type { ConfigService } from '@nestjs/config'

interface JwtRefreshPayload {
  sub: string
  iat?: number
  exp?: number
}

describe('RefreshStrategy', () => {
  let strategy: RefreshStrategy

  beforeEach(() => {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue('test-refresh-secret'),
      get: jest.fn(),
    } as unknown as ConfigService
    strategy = new RefreshStrategy(configService)
  })

  describe('validate', () => {
    it('유효한 요청에서 userId와 refreshToken을 반환한다', () => {
      const req = { cookies: { refresh_token: 'token-abc' } } as unknown as Request
      const payload: JwtRefreshPayload = { sub: 'user-1' }
      const result = strategy.validate(req, payload)
      expect(result).toEqual({ userId: 'user-1', refreshToken: 'token-abc' })
    })

    it('sub가 없으면 UnauthorizedException을 던진다', () => {
      const req = { cookies: { refresh_token: 'token-abc' } } as unknown as Request
      expect(() => strategy.validate(req, { sub: '' })).toThrow(UnauthorizedException)
    })

    it('payload가 null이면 UnauthorizedException을 던진다', () => {
      const req = { cookies: { refresh_token: 'token-abc' } } as unknown as Request
      expect(() => strategy.validate(req, null as unknown as JwtRefreshPayload)).toThrow(UnauthorizedException)
    })

    it('refresh_token 쿠키가 없으면 UnauthorizedException을 던진다', () => {
      const req = { cookies: {} } as unknown as Request
      expect(() => strategy.validate(req, { sub: 'user-1' })).toThrow(UnauthorizedException)
    })

    it('cookies 자체가 undefined이면 UnauthorizedException을 던진다', () => {
      const req = { cookies: undefined } as unknown as Request
      expect(() => strategy.validate(req, { sub: 'user-1' })).toThrow(UnauthorizedException)
    })
  })
})
