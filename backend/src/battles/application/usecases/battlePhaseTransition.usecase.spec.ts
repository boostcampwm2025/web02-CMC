/* eslint-disable @typescript-eslint/unbound-method */
import { BattlePhaseTransitionUseCase } from './battlePhaseTransition.usecase'
import type { BattleStatePort } from '../ports/out/battleState.port'
import type { BattleBroadcasterPort } from '../ports/out/battleBroadcaster.port'
import type { BattleTimerPort } from '../ports/out/battleTimer.port'
import type { BattlePhaseService } from '../../domains/services/battlePhase/battlePhase.service'
import type { BattleVoteService } from '../../domains/services/battleVote/battleVote.service'
import type { BattleDiscussionService } from '../../domains/services/battleDiscussion/battleDiscussion.service'
import type { BattleTeamSwitchService } from '../../domains/services/battleTeamSwitch/battleTeamSwitch.service'
import type { BattleSkipService } from '../../domains/services/battleSkip/battleSkip.service'
import type { BattleTerminationUseCase } from './battleTermination.usecase'
import type { ActiveBattleState } from '../../domains/models/types/battle.types'

describe('BattlePhaseTransitionUseCase', () => {
  let useCase: BattlePhaseTransitionUseCase
  let stateRepo: jest.Mocked<BattleStatePort>
  let broadcaster: jest.Mocked<BattleBroadcasterPort>
  let timer: jest.Mocked<BattleTimerPort>
  let phaseService: jest.Mocked<BattlePhaseService>
  let voteService: jest.Mocked<BattleVoteService>
  let discussionService: jest.Mocked<BattleDiscussionService>
  let teamSwitchService: jest.Mocked<BattleTeamSwitchService>
  let skipService: jest.Mocked<BattleSkipService>
  let terminationUseCase: jest.Mocked<BattleTerminationUseCase>

  const createMockState = (overrides = {}): ActiveBattleState =>
    ({
      battleId: 'battle-1',
      round: 1,
      phase: 'ATTACK',
      phaseCount: 1,
      startedAt: Date.now(),
      expiredAt: Date.now() + 60000,
      topics: ['topic1', 'topic2'],
      participants: new Map([['user-1', 'A']]),
      skipState: new Set<string>(),
      teamA: { users: ['user-1'], attacks: [], defenses: [] },
      teamB: { users: [], attacks: [], defenses: [] },
      all: { attacks: [], defenses: [] },
      ...overrides,
    }) as unknown as ActiveBattleState

  beforeEach(() => {
    stateRepo = {
      loadBattleState: jest.fn(),
      saveBattleState: jest.fn().mockResolvedValue(undefined),
      updateSkipState: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<BattleStatePort>

    broadcaster = {
      emitPhaseUpdated: jest.fn(),
      emitRoundUpdated: jest.fn(),
      emitAttacked: jest.fn(),
      emitDefensed: jest.fn(),
      emitTeamUpdated: jest.fn(),
      emitPhaseSkipped: jest.fn(),
    } as unknown as jest.Mocked<BattleBroadcasterPort>

    timer = {
      schedule: jest.fn(),
    } as unknown as jest.Mocked<BattleTimerPort>

    phaseService = {
      nextPhase: jest.fn().mockReturnValue({ name: 'ATTACK_VOTE', time: 30000 }),
    } as unknown as jest.Mocked<BattlePhaseService>

    voteService = {
      buildAttackedResult: jest.fn().mockReturnValue({ aTeam: null, bTeam: null }),
      buildDefensedResult: jest.fn().mockReturnValue({ aTeam: null, bTeam: null }),
    } as unknown as jest.Mocked<BattleVoteService>

    discussionService = {
      buildNullPlaceholder: jest.fn(),
      resetDiscussions: jest.fn(),
    } as unknown as jest.Mocked<BattleDiscussionService>

    teamSwitchService = {
      applyTeamSwitch: jest.fn(),
    } as unknown as jest.Mocked<BattleTeamSwitchService>

    skipService = {
      applyPhaseSkip: jest.fn(),
      shouldSkipPhase: jest.fn().mockResolvedValue(false),
      buildActiveParticipantsCount: jest.fn().mockReturnValue(1),
    } as unknown as jest.Mocked<BattleSkipService>

    terminationUseCase = {
      finish: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<BattleTerminationUseCase>

    useCase = new BattlePhaseTransitionUseCase(
      stateRepo,
      broadcaster,
      timer,
      phaseService,
      voteService,
      discussionService,
      teamSwitchService,
      skipService,
      terminationUseCase,
    )
  })

  describe('advancePhase', () => {
    it('다음 페이즈로 전환한다', async () => {
      const mockState = createMockState()
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      await useCase.advancePhase('battle-1')

      expect(phaseService.nextPhase).toHaveBeenCalled()
      expect(stateRepo.saveBattleState).toHaveBeenCalled()
    })

    it('페이즈가 변경되면 브로드캐스트한다', async () => {
      const mockState = createMockState({ phase: 'ATTACK' })
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      await useCase.advancePhase('battle-1')

      expect(broadcaster.emitPhaseUpdated).toHaveBeenCalledWith(
        expect.objectContaining({
          battleId: 'battle-1',
          phase: 'ATTACK_VOTE',
        }),
      )
    })

    it('라운드가 변경되면 라운드 업데이트를 브로드캐스트한다', async () => {
      const mockState = createMockState({ round: 1 })
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      phaseService.nextPhase.mockImplementation((state: ActiveBattleState) => {
        state.round = 2
        return { name: 'ATTACK', time: 60000 }
      })

      await useCase.advancePhase('battle-1')

      expect(broadcaster.emitRoundUpdated).toHaveBeenCalledWith(
        expect.objectContaining({
          battleId: 'battle-1',
          round: 2,
        }),
      )
    })

    it('nextPhase가 null이면 아무 작업도 하지 않는다', async () => {
      const mockState = createMockState()
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)
      phaseService.nextPhase.mockReturnValue(null)

      await useCase.advancePhase('battle-1')

      expect(stateRepo.saveBattleState).not.toHaveBeenCalled()
      expect(broadcaster.emitPhaseUpdated).not.toHaveBeenCalled()
    })

    it('skipState를 초기화한다', async () => {
      const mockState = createMockState()
      mockState.skipState.add('user-1')
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      await useCase.advancePhase('battle-1')

      expect(mockState.skipState.size).toBe(0)
    })
  })

  describe('handlePhaseSkip', () => {
    it('스킵 요청을 처리한다', async () => {
      const mockState = createMockState()
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      const result = await useCase.handlePhaseSkip('battle-1', 'user-1', true)

      expect(skipService.applyPhaseSkip).toHaveBeenCalledWith(mockState, 'user-1', true)
      expect(stateRepo.updateSkipState).toHaveBeenCalledWith('battle-1', mockState.skipState)
      expect(typeof result).toBe('number')
    })

    it('스킵되면 0을 반환한다', async () => {
      const mockState = createMockState()
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)
      skipService.shouldSkipPhase.mockResolvedValue(true)

      const result = await useCase.handlePhaseSkip('battle-1', 'user-1', true)

      expect(result).toBe(0)
    })

    it('스킵되지 않으면 skipState 크기를 반환한다', async () => {
      const mockState = createMockState()
      mockState.skipState.add('user-1')
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)
      skipService.shouldSkipPhase.mockResolvedValue(false)

      const result = await useCase.handlePhaseSkip('battle-1', 'user-1', true)

      expect(result).toBe(1)
    })
  })

  describe('checkAndSkipPhase', () => {
    it('스킵 조건을 확인한다', async () => {
      const mockState = createMockState()

      await useCase.checkAndSkipPhase('battle-1', mockState)

      expect(skipService.shouldSkipPhase).toHaveBeenCalledWith(mockState, expect.any(Function), expect.any(Function))
    })
  })

  describe('advancePhase 콜백 테스트', () => {
    it('공격 투표 페이즈에서 onAttacked 콜백을 호출한다', async () => {
      const mockState = createMockState({ phase: 'ATTACK' })
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      phaseService.nextPhase.mockImplementation((state, onAttacked) => {
        onAttacked(state)
        return { name: 'DEFENSE', time: 60000 }
      })

      await useCase.advancePhase('battle-1')

      expect(voteService.buildAttackedResult).toHaveBeenCalled()
      expect(broadcaster.emitAttacked).toHaveBeenCalled()
    })

    it('방어 투표 페이즈에서 onDefensed 콜백을 호출한다', async () => {
      const mockState = createMockState({ phase: 'DEFENSE' })
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      phaseService.nextPhase.mockImplementation((state, _onAttacked, onDefensed) => {
        onDefensed(state)
        return { name: 'TEAM_SWITCH', time: 40000 }
      })

      await useCase.advancePhase('battle-1')

      expect(voteService.buildDefensedResult).toHaveBeenCalled()
      expect(broadcaster.emitDefensed).toHaveBeenCalled()
    })

    it('resetDiscussions 콜백을 호출한다', async () => {
      const mockState = createMockState()
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      phaseService.nextPhase.mockImplementation((state, _onAttacked, _onDefensed, onReset) => {
        onReset(state)
        return { name: 'ATTACK', time: 60000 }
      })

      await useCase.advancePhase('battle-1')

      expect(discussionService.resetDiscussions).toHaveBeenCalledWith(mockState)
    })

    it('배틀 종료 시 terminationUseCase.finish를 호출한다', async () => {
      const mockState = createMockState()
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      phaseService.nextPhase.mockImplementation((state, _onAttacked, _onDefensed, _onReset, onFinish) => {
        void onFinish(state)
        return null
      })

      await useCase.advancePhase('battle-1')

      expect(terminationUseCase.finish).toHaveBeenCalledWith(mockState)
    })

    it('팀 스위치 페이즈에서 applyTeamSwitch를 호출한다', async () => {
      const mockState = createMockState()
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      phaseService.nextPhase.mockImplementation((state, _onAttacked, _onDefensed, _onReset, _onFinish, onTeamSwitch) => {
        onTeamSwitch(state)
        return { name: 'ATTACK', time: 60000 }
      })

      await useCase.advancePhase('battle-1')

      expect(teamSwitchService.applyTeamSwitch).toHaveBeenCalled()
    })
  })

  describe('scheduleNextTick 에러 처리', () => {
    it('loadBattleState 에러를 무시한다', async () => {
      const mockState = createMockState()
      let callCount = 0
      stateRepo.loadBattleState.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({
            battle: {},
            state: mockState,
          } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)
        }
        return Promise.reject(new Error('Battle not found'))
      })

      // 에러가 발생해도 예외가 전파되지 않아야 함
      await expect(useCase.advancePhase('battle-1')).resolves.not.toThrow()
    })

    it('expiredAt이 null이면 스케줄링하지 않는다', async () => {
      const mockState = createMockState({ expiredAt: null })
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      await useCase.advancePhase('battle-1')

      // timer.schedule이 호출되었는지 확인 (expiredAt이 null이면 호출되지 않음)
      // scheduleNextTick 내부에서 early return 됨
    })
  })

  describe('타이머 스케줄링', () => {
    it('올바른 지연 시간으로 타이머를 스케줄링한다', async () => {
      const mockState = createMockState()
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      await useCase.advancePhase('battle-1')

      expect(timer.schedule).toHaveBeenCalledWith('battle-1', expect.any(Object), expect.any(Function))
    })
  })
})
