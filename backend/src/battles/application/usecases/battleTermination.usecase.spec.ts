/* eslint-disable @typescript-eslint/unbound-method */
import { BattleTerminationUseCase } from './battleTermination.usecase'
import { BATTLE_STATUS, BATTLE_TEAM } from '../../domains/models/const/battles.const'
import type { BattleRepoPort } from '../ports/out/battleRepository.port'
import type { BattleStatePort } from '../ports/out/battleState.port'
import type { BattleBroadcasterPort } from '../ports/out/battleBroadcaster.port'
import type { BattleTimerPort } from '../ports/out/battleTimer.port'
import type { BattleResultService } from '../../domains/services/battleResult/battleResult.service'
import type { BattleTimelineService } from '../../domains/services/battleTimeline/battleTimeline.service'
import type { BattleMvpService } from '../../domains/services/battleMvp/battleMvp.service'
import type { BattleTierService } from '../../domains/services/battleTier/battleTier.service'
import type { ActiveBattleState } from '../../domains/models/types/battle.types'

describe('BattleTerminationUseCase', () => {
  let useCase: BattleTerminationUseCase
  let repo: jest.Mocked<BattleRepoPort>
  let stateRepo: jest.Mocked<BattleStatePort>
  let broadcaster: jest.Mocked<BattleBroadcasterPort>
  let timer: jest.Mocked<BattleTimerPort>
  let resultService: jest.Mocked<BattleResultService>
  let timelineService: jest.Mocked<BattleTimelineService>
  let mvpService: jest.Mocked<BattleMvpService>
  let tierService: jest.Mocked<BattleTierService>

  const createMockState = (overrides = {}): ActiveBattleState =>
    ({
      battleId: 'battle-1',
      participants: new Map([
        ['user-1', BATTLE_TEAM.A],
        ['user-2', BATTLE_TEAM.B],
      ]),
      teamA: { users: ['user-1'] },
      teamB: { users: ['user-2'] },
      opinionHistory: [],
      ...overrides,
    }) as unknown as ActiveBattleState

  beforeEach(() => {
    repo = {
      update: jest.fn().mockResolvedValue({}),
      findManyUsers: jest.fn().mockResolvedValue([]),
      transaction: jest.fn().mockImplementation(async (cb: (txRepo: unknown) => Promise<unknown>) => {
        const txRepo = {
          updateManyBattleParticipants: jest.fn().mockResolvedValue({}),
          updateUser: jest.fn().mockResolvedValue({}),
        }
        await cb(txRepo)
      }),
    } as unknown as jest.Mocked<BattleRepoPort>

    stateRepo = {
      clearCache: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<BattleStatePort>

    broadcaster = {
      emitBattleClosed: jest.fn(),
    } as unknown as jest.Mocked<BattleBroadcasterPort>

    timer = {
      cancel: jest.fn(),
    } as unknown as jest.Mocked<BattleTimerPort>

    resultService = {
      determineWinningTeam: jest.fn().mockReturnValue('A'),
      toBattleResultForTeam: jest.fn().mockReturnValue('WIN'),
    } as unknown as jest.Mocked<BattleResultService>

    timelineService = {
      buildTimeline: jest.fn().mockReturnValue([]),
    } as unknown as jest.Mocked<BattleTimelineService>

    mvpService = {
      buildMvps: jest.fn().mockReturnValue([{ userId: 'user-1', nickname: 'MVP1', team: 'A', score: 100 }]),
    } as unknown as jest.Mocked<BattleMvpService>

    tierService = {
      buildRatingUpdates: jest.fn().mockReturnValue([]),
    } as unknown as jest.Mocked<BattleTierService>

    useCase = new BattleTerminationUseCase(repo, stateRepo, broadcaster, timer, resultService, timelineService, mvpService, tierService)
  })

  describe('finish', () => {
    it('배틀을 종료한다', async () => {
      const mockState = createMockState()

      await useCase.finish(mockState)

      expect(timer.cancel).toHaveBeenCalledWith('battle-1')
      expect(repo.update).toHaveBeenCalledWith(
        'battle-1',
        expect.objectContaining({
          status: BATTLE_STATUS.CLOSED,
          teamACount: 1,
          teamBCount: 1,
          totalParticipantsCount: 2,
        }),
      )
    })

    it('우승 팀을 결정한다', async () => {
      const mockState = createMockState()

      await useCase.finish(mockState)

      expect(resultService.determineWinningTeam).toHaveBeenCalledWith(1, 1)
      expect(repo.update).toHaveBeenCalledWith(
        'battle-1',
        expect.objectContaining({
          winningTeam: 'A',
        }),
      )
    })

    it('MVP를 계산한다', async () => {
      const mockState = createMockState()

      await useCase.finish(mockState)

      expect(mvpService.buildMvps).toHaveBeenCalledWith(mockState, 'A')
      expect(repo.update).toHaveBeenCalledWith(
        'battle-1',
        expect.objectContaining({
          mvps: ['MVP1'],
        }),
      )
    })

    it('타임라인을 생성한다', async () => {
      const mockState = createMockState()

      await useCase.finish(mockState)

      expect(timelineService.buildTimeline).toHaveBeenCalledWith(mockState)
    })

    it('배틀 종료를 브로드캐스트한다', async () => {
      const mockState = createMockState()

      await useCase.finish(mockState)

      expect(broadcaster.emitBattleClosed).toHaveBeenCalledWith(
        expect.objectContaining({
          battleId: 'battle-1',
        }),
      )
    })

    it('참가자가 있으면 레이팅 업데이트를 수행한다', async () => {
      const mockState = createMockState()
      repo.findManyUsers.mockResolvedValue([
        { id: 'user-1', rating: 1000, tier: 'SILVER' },
        { id: 'user-2', rating: 1000, tier: 'SILVER' },
      ])
      tierService.buildRatingUpdates.mockReturnValue([
        { userId: 'user-1', currentRating: 1000, currentTier: 'SILVER', nextRating: 1050, nextTier: 'SILVER', delta: 50, mvpBonus: 0 },
        { userId: 'user-2', currentRating: 1000, currentTier: 'SILVER', nextRating: 950, nextTier: 'SILVER', delta: -50, mvpBonus: 0 },
      ])

      await useCase.finish(mockState)

      expect(repo.findManyUsers).toHaveBeenCalledWith({
        where: { id: { in: ['user-1', 'user-2'] } },
        select: { id: true, rating: true, tier: true },
      })
      expect(tierService.buildRatingUpdates).toHaveBeenCalled()
      expect(repo.transaction).toHaveBeenCalled()
    })

    it('참가자가 없으면 레이팅 업데이트를 건너뛴다', async () => {
      const mockState = createMockState({ participants: new Map() })

      await useCase.finish(mockState)

      expect(repo.findManyUsers).not.toHaveBeenCalled()
      expect(tierService.buildRatingUpdates).not.toHaveBeenCalled()
    })

    it('등록된 사용자가 없으면 레이팅 업데이트를 건너뛴다', async () => {
      const mockState = createMockState()
      repo.findManyUsers.mockResolvedValue([])

      await useCase.finish(mockState)

      expect(tierService.buildRatingUpdates).not.toHaveBeenCalled()
      expect(repo.transaction).not.toHaveBeenCalled()
    })

    it('상태 필드를 null로 초기화한다', async () => {
      const mockState = createMockState()

      await useCase.finish(mockState)

      expect(repo.update).toHaveBeenCalledWith(
        'battle-1',
        expect.objectContaining({
          currentRound: null,
          currentPhase: null,
          phaseCount: null,
          startedAt: null,
          expiredAt: null,
        }),
      )
    })
  })
})
