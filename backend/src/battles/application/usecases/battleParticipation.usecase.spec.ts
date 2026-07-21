/* eslint-disable @typescript-eslint/unbound-method */
import { BadRequestException } from '@nestjs/common'
import { BattleParticipationUseCase } from './battleParticipation.usecase'
import { BATTLE_STATUS, BATTLE_TEAM } from '../../domains/models/const/battles.const'
import type { BattleRepoPort } from '../ports/out/battleRepository.port'
import type { BattleStatePort } from '../ports/out/battleState.port'
import type { BattleBroadcasterPort } from '../ports/out/battleBroadcaster.port'
import type { BattleTeamSwitchService } from '../../domains/services/battleTeamSwitch/battleTeamSwitch.service'
import type { BattlePhaseTransitionUseCase } from './battlePhaseTransition.usecase'
import type { BattleJoinRequestDto } from '../../dto/battleJoinRequest.dto'
import type { ActiveBattleState } from '../../domains/models/types/battle.types'

describe('BattleParticipationUseCase', () => {
  let useCase: BattleParticipationUseCase
  let repo: jest.Mocked<BattleRepoPort>
  let stateRepo: jest.Mocked<BattleStatePort>
  let broadcaster: jest.Mocked<BattleBroadcasterPort>
  let teamSwitchService: jest.Mocked<BattleTeamSwitchService>
  let phaseTransitionUseCase: jest.Mocked<BattlePhaseTransitionUseCase>

  const createMockState = (): ActiveBattleState =>
    ({
      battleId: 'battle-1',
      participants: new Map(),
      userInfoMap: new Map(),
      teamVotes: new Map(),
      skipState: new Set<string>(),
      teamA: { users: ['user-1'] },
      teamB: { users: [] },
    }) as unknown as ActiveBattleState

  beforeEach(() => {
    repo = {
      findUniqueUser: jest.fn().mockResolvedValue({ id: 'user-1' }),
      upsertBattleParticipant: jest.fn().mockResolvedValue({}),
    } as unknown as jest.Mocked<BattleRepoPort>

    stateRepo = {
      loadBattleState: jest.fn(),
      saveBattleState: jest.fn(),
    } as unknown as jest.Mocked<BattleStatePort>

    broadcaster = {
      emitUserUpdated: jest.fn(),
    } as unknown as jest.Mocked<BattleBroadcasterPort>

    teamSwitchService = {
      applyParticipant: jest.fn(),
    } as unknown as jest.Mocked<BattleTeamSwitchService>

    phaseTransitionUseCase = {
      checkAndSkipPhase: jest.fn().mockResolvedValue(false),
    } as unknown as jest.Mocked<BattlePhaseTransitionUseCase>

    useCase = new BattleParticipationUseCase(repo, stateRepo, broadcaster, teamSwitchService, phaseTransitionUseCase)
  })

  describe('join', () => {
    it('배틀에 참가한다', async () => {
      const mockState = createMockState()
      stateRepo.loadBattleState.mockResolvedValue({
        battle: { status: BATTLE_STATUS.OPEN },
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      const dto: BattleJoinRequestDto = {
        battleId: 'battle-1',
        team: BATTLE_TEAM.A,
        nickname: '테스터',
      } as unknown as BattleJoinRequestDto

      const result = await useCase.join(dto, 'user-1')

      expect(result.battleState).toBe(mockState)
      expect(result.team).toBe(BATTLE_TEAM.A)
      expect(stateRepo.saveBattleState).toHaveBeenCalledWith('battle-1', mockState)
    })

    it('닉네임이 userInfoMap에 저장된다', async () => {
      const mockState = createMockState()
      stateRepo.loadBattleState.mockResolvedValue({
        battle: { status: BATTLE_STATUS.OPEN },
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      const dto: BattleJoinRequestDto = {
        battleId: 'battle-1',
        team: BATTLE_TEAM.A,
        nickname: '테스터',
      } as unknown as BattleJoinRequestDto

      await useCase.join(dto, 'user-1')

      expect(mockState.userInfoMap.get('user-1')).toBe('테스터')
    })

    it('등록된 사용자의 tier를 userInfoMap에 함께 저장한다', async () => {
      repo.findUniqueUser.mockResolvedValue({ id: 'user-1', tier: 'GOLD' })
      const mockState = createMockState()
      stateRepo.loadBattleState.mockResolvedValue({
        battle: { status: BATTLE_STATUS.OPEN },
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      const dto: BattleJoinRequestDto = {
        battleId: 'battle-1',
        team: BATTLE_TEAM.A,
        nickname: '테스터',
      } as unknown as BattleJoinRequestDto

      await useCase.join(dto, 'user-1')

      expect(mockState.userInfoMap.get('user-1')).toEqual({ nickname: '테스터', tier: 'GOLD' })
    })

    it('battleId가 없으면 BadRequestException을 던진다', async () => {
      const dto: BattleJoinRequestDto = {
        battleId: '',
        team: BATTLE_TEAM.A,
        nickname: '테스터',
      } as unknown as BattleJoinRequestDto

      await expect(useCase.join(dto, 'user-1')).rejects.toThrow(BadRequestException)
      await expect(useCase.join(dto, 'user-1')).rejects.toThrow('Battle ID가 필요합니다.')
    })

    it('CLOSED 상태의 배틀에는 참가할 수 없다', async () => {
      stateRepo.loadBattleState.mockResolvedValue({
        battle: { status: BATTLE_STATUS.CLOSED },
        state: { ...createMockState(), status: BATTLE_STATUS.CLOSED },
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      const dto: BattleJoinRequestDto = {
        battleId: 'battle-1',
        team: BATTLE_TEAM.A,
        nickname: '테스터',
      } as unknown as BattleJoinRequestDto

      await expect(useCase.join(dto, 'user-1')).rejects.toThrow(BadRequestException)
      await expect(useCase.join(dto, 'user-1')).rejects.toThrow('이미 종료된 배틀입니다.')
    })

    it('등록된 사용자는 battleParticipant에 저장된다', async () => {
      const mockState = createMockState()
      stateRepo.loadBattleState.mockResolvedValue({
        battle: { status: BATTLE_STATUS.OPEN },
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      const dto: BattleJoinRequestDto = {
        battleId: 'battle-1',
        team: BATTLE_TEAM.A,
        nickname: '테스터',
      } as unknown as BattleJoinRequestDto

      await useCase.join(dto, 'user-1')

      expect(repo.upsertBattleParticipant).toHaveBeenCalledWith({
        userId: 'user-1',
        battleId: 'battle-1',
        team: 'A',
        isMvp: false,
      })
    })

    it('게스트 사용자는 battleParticipant에 저장되지 않는다', async () => {
      repo.findUniqueUser.mockResolvedValue(null)
      const mockState = createMockState()
      stateRepo.loadBattleState.mockResolvedValue({
        battle: { status: BATTLE_STATUS.OPEN },
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      const dto: BattleJoinRequestDto = {
        battleId: 'battle-1',
        team: BATTLE_TEAM.A,
        nickname: '테스터',
      } as unknown as BattleJoinRequestDto

      await useCase.join(dto, 'guest-1')

      expect(repo.upsertBattleParticipant).not.toHaveBeenCalled()
    })
  })

  describe('leave', () => {
    it('배틀에서 나간다', async () => {
      const mockState = createMockState()
      mockState.teamA.users = ['user-1', 'user-2']
      mockState.participants.set('user-1', BATTLE_TEAM.A)
      mockState.skipState.add('user-1')
      mockState.teamVotes.set('user-1', BATTLE_TEAM.B)

      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      const result = await useCase.leave('user-1', 'battle-1')

      expect(mockState.teamA.users).not.toContain('user-1')
      expect(mockState.participants.has('user-1')).toBe(false)
      expect(mockState.skipState.has('user-1')).toBe(false)
      expect(mockState.teamVotes.has('user-1')).toBe(false)
      expect(stateRepo.saveBattleState).toHaveBeenCalledWith('battle-1', mockState)
      expect(phaseTransitionUseCase.checkAndSkipPhase).toHaveBeenCalledWith('battle-1', mockState)
      expect(result).toBeDefined()
    })

    it('userId가 없으면 BadRequestException을 던진다', async () => {
      await expect(useCase.leave('', 'battle-1')).rejects.toThrow(BadRequestException)
      await expect(useCase.leave('', 'battle-1')).rejects.toThrow('유효하지 않은 요청입니다.')
    })

    it('battleId가 없으면 BadRequestException을 던진다', async () => {
      await expect(useCase.leave('user-1', '')).rejects.toThrow(BadRequestException)
    })
  })
})
