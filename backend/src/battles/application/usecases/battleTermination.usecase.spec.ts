/* eslint-disable @typescript-eslint/unbound-method */
import { BattleTerminationUseCase } from './battleTermination.usecase'
import { BATTLE_STATUS, BATTLE_TEAM } from '../../domains/models/const/battles.const'
import type { BattleRepoPort } from '../ports/out/battleRepository.port'
import type { BattleStatePort } from '../ports/out/battleState.port'
import type { BattleBroadcasterPort } from '../ports/out/battleBroadcaster.port'
import type { BattleTimerPort } from '../ports/out/battleTimer.port'
import type { KafkaPubPort } from '../ports/out/kafkaPublish.port'
import type { BattleResultService } from '../../domains/services/battleResult/battleResult.service'
import type { BattleTimelineService } from '../../domains/services/battleTimeline/battleTimeline.service'
import type { BattleMvpService } from '../../domains/services/battleMvp/battleMvp.service'
import type { ActiveBattleState } from '../../domains/models/types/battle.types'

describe('BattleTerminationUseCase', () => {
  let useCase: BattleTerminationUseCase
  let repo: jest.Mocked<BattleRepoPort>
  let stateRepo: jest.Mocked<BattleStatePort>
  let broadcaster: jest.Mocked<BattleBroadcasterPort>
  let timer: jest.Mocked<BattleTimerPort>
  let kafkaPubPort: jest.Mocked<KafkaPubPort>
  let resultService: jest.Mocked<BattleResultService>
  let timelineService: jest.Mocked<BattleTimelineService>
  let mvpService: jest.Mocked<BattleMvpService>

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
      clearBattleStateFromRedis: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<BattleStatePort>

    broadcaster = {
      emitBattleClosed: jest.fn(),
    } as unknown as jest.Mocked<BattleBroadcasterPort>

    timer = {
      cancel: jest.fn(),
    } as unknown as jest.Mocked<BattleTimerPort>

    kafkaPubPort = {
      publishChat: jest.fn().mockResolvedValue(undefined),
      publishBattleCreated: jest.fn().mockResolvedValue(undefined),
      publishBattlePhaseChanged: jest.fn().mockResolvedValue(undefined),
      publishBattleTerminated: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<KafkaPubPort>

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
    useCase = new BattleTerminationUseCase(repo, stateRepo, broadcaster, timer, kafkaPubPort, resultService, timelineService, mvpService)
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

    it('배틀 종료 카프카 이벤트를 발행한다 (티어 계산 컨슈머용)', async () => {
      const mockState = createMockState()

      await useCase.finish(mockState)

      expect(kafkaPubPort.publishBattleTerminated).toHaveBeenCalledWith({
        battleId: 'battle-1',
        participants: [
          ['user-1', 'A'],
          ['user-2', 'B'],
        ],
        winningTeam: 'A',
        mvpIds: ['user-1'],
        finishedAt: expect.any(Number),
      })
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
