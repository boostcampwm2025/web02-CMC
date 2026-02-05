/* eslint-disable @typescript-eslint/unbound-method */
import { NotFoundException } from '@nestjs/common'
import { CreateGuestUseCase } from './createGuest.usecase'
import { BATTLE_STATUS } from '../../domains/models/const/battles.const'
import type { BattleStatePort } from '../ports/out/battleState.port'
import type { BattleIdentifierPort } from '../ports/out/battleIdentifier.port'
import type { GuestCheckPort } from '../ports/out/guestCheck.port'
import type { BattleGuestService } from '../../domains/services/battleGuest/battleGuest.service'
import type { ActiveBattleState } from '../../domains/models/types/battle.types'

describe('CreateGuestUseCase', () => {
  let useCase: CreateGuestUseCase
  let stateRepo: jest.Mocked<BattleStatePort>
  let identifierPort: jest.Mocked<BattleIdentifierPort>
  let guestCheckPort: jest.Mocked<GuestCheckPort>
  let guestService: jest.Mocked<BattleGuestService>

  const createMockState = (): ActiveBattleState =>
    ({
      battleId: 'battle-1',
      round: 1,
      phase: 'PENDING',
      participants: new Map(),
      userInfoMap: new Map(),
      teamA: { users: [] },
      teamB: { users: [] },
    }) as unknown as ActiveBattleState

  beforeEach(() => {
    stateRepo = {
      loadBattleState: jest.fn(),
      saveBattleState: jest.fn(),
      isNicknameDuplicate: jest.fn(),
    } as unknown as jest.Mocked<BattleStatePort>

    identifierPort = {
      generateId: jest.fn().mockReturnValue('guest-id-123'),
    } as unknown as jest.Mocked<BattleIdentifierPort>

    guestCheckPort = {
      isNicknameExists: jest.fn().mockResolvedValue(false),
    } as unknown as jest.Mocked<GuestCheckPort>

    guestService = {
      buildGuestNickname: jest.fn().mockResolvedValue('Guest1234'),
      buildGuest: jest.fn().mockReturnValue({
        odpiUserId: 'guest-id-123',
        nickname: 'Guest1234',
        isGuest: true,
      }),
      applyGuestToState: jest.fn(),
    } as unknown as jest.Mocked<BattleGuestService>

    useCase = new CreateGuestUseCase(stateRepo, identifierPort, guestCheckPort, guestService)
  })

  describe('execute', () => {
    it('게스트를 생성하고 반환한다', async () => {
      const mockState = createMockState()
      stateRepo.loadBattleState.mockResolvedValue({
        battle: { status: BATTLE_STATUS.OPEN },
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      const result = await useCase.execute('battle-1')

      expect(result).toEqual({
        odpiUserId: 'guest-id-123',
        nickname: 'Guest1234',
        isGuest: true,
      })
      expect(guestService.buildGuestNickname).toHaveBeenCalledWith('battle-1', expect.any(Function), expect.any(Function))
      expect(guestService.buildGuest).toHaveBeenCalledWith('Guest1234', expect.any(Function))
      expect(guestService.applyGuestToState).toHaveBeenCalledWith(mockState, expect.any(Object))
      expect(stateRepo.saveBattleState).toHaveBeenCalledWith('battle-1', mockState)
    })

    it('배틀이 CLOSED 상태이면 NotFoundException을 던진다', async () => {
      stateRepo.loadBattleState.mockResolvedValue({
        battle: { status: BATTLE_STATUS.CLOSED },
        state: createMockState(),
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      await expect(useCase.execute('battle-1')).rejects.toThrow(NotFoundException)
      await expect(useCase.execute('battle-1')).rejects.toThrow('해당 배틀은 현재 진행 중이지 않습니다.')
    })

    it('PENDING 상태에서도 게스트 생성이 가능하다', async () => {
      const mockState = createMockState()
      stateRepo.loadBattleState.mockResolvedValue({
        battle: { status: BATTLE_STATUS.PENDING },
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      const result = await useCase.execute('battle-1')

      expect(result.isGuest).toBe(true)
    })
  })
})
