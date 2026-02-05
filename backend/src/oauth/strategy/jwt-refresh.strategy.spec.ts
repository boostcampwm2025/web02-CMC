import { UnauthorizedException } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import { RefreshGuard } from './jwt-refresh.strategy'

describe('RefreshGuard', () => {
  let guard: RefreshGuard

  beforeEach(() => {
    guard = new RefreshGuard()
  })

  const createMockContext = (cookies?: Record<string, string>): ExecutionContext => {
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          cookies,
          user: undefined,
        }),
      }),
    } as unknown as ExecutionContext
  }

  describe('canActivate', () => {
    it('session_id 쿠키가 있으면 true를 반환하고 user에 sessionId를 설정한다', () => {
      const mockRequest = { cookies: { session_id: 'session-abc' }, user: undefined as unknown }
      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as unknown as ExecutionContext

      const result = guard.canActivate(context)

      expect(result).toBe(true)
      expect(mockRequest.user).toEqual({ userId: '', sessionId: 'session-abc' })
    })

    it('session_id 쿠키가 없으면 UnauthorizedException을 던진다', () => {
      const context = createMockContext({})

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
      expect(() => guard.canActivate(context)).toThrow('세션이 없습니다.')
    })

    it('cookies가 undefined이면 UnauthorizedException을 던진다', () => {
      const context = createMockContext(undefined)

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
    })
  })
})
