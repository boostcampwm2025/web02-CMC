import { InviteAccessGuard } from './inviteAccess.guard'
import { ForbiddenException, type ExecutionContext } from '@nestjs/common'
import type { BattlePrivacyCheckPort } from '../application/ports/out/battlePrivacyCheck.port'

describe('InviteAccessGuard', () => {
  let guard: InviteAccessGuard
  let privacyCheckPort: jest.Mocked<BattlePrivacyCheckPort>

  beforeEach(() => {
    privacyCheckPort = {
      isPrivateBattle: jest.fn(),
    }
    guard = new InviteAccessGuard(privacyCheckPort)
  })

  const createContext = (params: Record<string, string> = {}, cookies: Record<string, string> = {}): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ params, cookies }),
      }),
    }) as unknown as ExecutionContext

  it('battleId가 없으면 true를 반환한다', async () => {
    const context = createContext({}, {})
    const result = await guard.canActivate(context)
    expect(result).toBe(true)
  })

  it('공개 배틀이면 true를 반환한다', async () => {
    privacyCheckPort.isPrivateBattle.mockResolvedValue(false)
    const context = createContext({ id: 'battle-1' })
    const result = await guard.canActivate(context)
    expect(result).toBe(true)
  })

  it('비공개 배틀에서 초대 쿠키가 있으면 true를 반환한다', async () => {
    privacyCheckPort.isPrivateBattle.mockResolvedValue(true)
    const context = createContext({ id: 'battle-1' }, { 'inviteAccess_battle-1': 'valid' })
    const result = await guard.canActivate(context)
    expect(result).toBe(true)
  })

  it('비공개 배틀에서 초대 쿠키가 없으면 ForbiddenException을 던진다', async () => {
    privacyCheckPort.isPrivateBattle.mockResolvedValue(true)
    const context = createContext({ id: 'battle-1' }, {})
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException)
  })
})
