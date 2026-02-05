import { ExecutionContext } from '@nestjs/common'
import { JwtAuthGuard } from './jwt-auth.guard'

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard

  beforeEach(() => {
    guard = new JwtAuthGuard()
  })

  describe('canActivate', () => {
    it('부모 클래스의 canActivate를 호출한다', () => {
      const mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
        }),
      } as unknown as ExecutionContext

      const superCanActivate = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
      superCanActivate.mockReturnValue(true)

      const result = guard.canActivate(mockContext)

      expect(result).toBe(true)
    })
  })
})
