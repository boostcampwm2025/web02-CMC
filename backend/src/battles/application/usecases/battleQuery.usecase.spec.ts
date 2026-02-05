/* eslint-disable @typescript-eslint/unbound-method */
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { BattleQueryUseCase } from './battleQuery.usecase'
import { BATTLE_STATUS } from '../../domains/models/const/battles.const'
import type { BattleRepoPort } from '../ports/out/battleRepository.port'
import type { BattleStatePort } from '../ports/out/battleState.port'
import type { BattleResultService } from '../../domains/services/battleResult/battleResult.service'
import type { BattleTimelineService } from '../../domains/services/battleTimeline/battleTimeline.service'
import type { BattleMvpService } from '../../domains/services/battleMvp/battleMvp.service'
import type { ActiveBattleState } from '../../domains/models/types/battle.types'

describe('BattleQueryUseCase', () => {
  let useCase: BattleQueryUseCase
  let repo: jest.Mocked<BattleRepoPort>
  let stateRepo: jest.Mocked<BattleStatePort>
  let resultService: jest.Mocked<BattleResultService>
  let timelineService: jest.Mocked<BattleTimelineService>
  let mvpService: jest.Mocked<BattleMvpService>

  const createMockBattle = (overrides = {}) => ({
    id: 'battle-1',
    userId: 'user-1',
    title: '테스트 배틀',
    description: '설명',
    codeA: 'code A',
    codeB: 'code B',
    language: 'javascript',
    category: 'algorithm',
    playTime: 'FIFTEEN_MIN',
    topics: ['topic1'],
    inviteCode: null,
    isPrivate: false,
    status: BATTLE_STATUS.OPEN,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  })

  const createMockState = (): ActiveBattleState =>
    ({
      battleId: 'battle-1',
      participants: new Map([['user-1', 'A']]),
      teamA: { users: ['user-1'], attacks: [], defenses: [] },
      teamB: { users: [], attacks: [], defenses: [] },
      all: { attacks: [], defenses: [] },
    }) as unknown as ActiveBattleState

  beforeEach(() => {
    repo = {
      findBattleList: jest.fn().mockResolvedValue([]),
      countBattleList: jest.fn().mockResolvedValue(0),
      findUnique: jest.fn(),
      findUniqueByInviteCode: jest.fn(),
    } as unknown as jest.Mocked<BattleRepoPort>

    stateRepo = {
      loadBattleState: jest.fn(),
      parseMvpsState: jest.fn().mockReturnValue([]),
    } as unknown as jest.Mocked<BattleStatePort>

    resultService = {
      buildBattleResult: jest.fn().mockReturnValue({
        winner: 'A',
        teamAVotes: 5,
        teamBVotes: 3,
      }),
    } as unknown as jest.Mocked<BattleResultService>

    timelineService = {
      toTimeline: jest.fn().mockReturnValue([]),
    } as unknown as jest.Mocked<BattleTimelineService>

    mvpService = {
      buildLegacyMvpsFromNicknames: jest.fn().mockReturnValue([]),
    } as unknown as jest.Mocked<BattleMvpService>

    useCase = new BattleQueryUseCase(repo, stateRepo, resultService, timelineService, mvpService)
  })

  describe('getOpenBattles', () => {
    it('열린 배틀 목록을 반환한다', async () => {
      repo.findBattleList.mockResolvedValue([createMockBattle()])
      repo.countBattleList.mockResolvedValue(1)

      const result = await useCase.getOpenBattles(10, 0)

      expect(result.battles).toHaveLength(1)
      expect(result.meta).toEqual({ offset: 0, limit: 10, total: 1 })
      expect(repo.findBattleList).toHaveBeenCalledWith(
        expect.objectContaining({
          onlyPublic: true,
          status: { in: [BATTLE_STATUS.OPEN, BATTLE_STATUS.PENDING] },
        }),
      )
    })

    it('빈 배열을 반환할 수 있다', async () => {
      repo.findBattleList.mockResolvedValue([])
      repo.countBattleList.mockResolvedValue(0)

      const result = await useCase.getOpenBattles(10, 0)

      expect(result.battles).toEqual([])
      expect(result.meta.total).toBe(0)
    })
  })

  describe('getClosedBattles', () => {
    it('종료된 배틀 목록을 반환한다', async () => {
      repo.findBattleList.mockResolvedValue([
        createMockBattle({
          status: BATTLE_STATUS.CLOSED,
          teamACount: 5,
          teamBCount: 3,
          totalParticipantsCount: 8,
          winningTeam: 'A',
        }),
      ])
      repo.countBattleList.mockResolvedValue(1)

      const result = await useCase.getClosedBattles(10, 0)

      expect(result.battles).toHaveLength(1)
      expect(repo.findBattleList).toHaveBeenCalledWith(
        expect.objectContaining({
          status: BATTLE_STATUS.CLOSED,
        }),
      )
    })
  })

  describe('getBattleByInviteCode', () => {
    it('초대 코드로 배틀 ID를 찾는다', async () => {
      repo.findUniqueByInviteCode.mockResolvedValue(createMockBattle({ id: 'battle-123' }))

      const result = await useCase.getBattleByInviteCode('INVITE123')

      expect(result.battleId).toBe('battle-123')
    })

    it('초대 코드가 없으면 BadRequestException을 던진다', async () => {
      await expect(useCase.getBattleByInviteCode('')).rejects.toThrow(BadRequestException)
      await expect(useCase.getBattleByInviteCode('')).rejects.toThrow('초대 코드가 필요합니다.')
    })

    it('배틀을 찾을 수 없으면 NotFoundException을 던진다', async () => {
      repo.findUniqueByInviteCode.mockResolvedValue(null)

      await expect(useCase.getBattleByInviteCode('INVALID')).rejects.toThrow(NotFoundException)
      await expect(useCase.getBattleByInviteCode('INVALID')).rejects.toThrow('잘못된 초대 코드입니다.')
    })

    it('배틀이 종료되었으면 BadRequestException을 던진다', async () => {
      repo.findUniqueByInviteCode.mockResolvedValue(createMockBattle({ status: BATTLE_STATUS.CLOSED }))

      await expect(useCase.getBattleByInviteCode('INVITE123')).rejects.toThrow(BadRequestException)
      await expect(useCase.getBattleByInviteCode('INVITE123')).rejects.toThrow('이미 종료된 배틀입니다.')
    })
  })

  describe('getJoinBattleInfo', () => {
    it('배틀 참가 정보를 반환한다', async () => {
      repo.findUnique.mockResolvedValue(createMockBattle())
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: createMockState(),
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      const result = await useCase.getJoinBattleInfo('battle-1')

      expect(result).toBeDefined()
      expect(repo.findUnique).toHaveBeenCalledWith('battle-1')
    })

    it('battleId가 없으면 BadRequestException을 던진다', async () => {
      await expect(useCase.getJoinBattleInfo('')).rejects.toThrow(BadRequestException)
      await expect(useCase.getJoinBattleInfo('')).rejects.toThrow('Battle ID가 필요합니다.')
    })

    it('종료된 배틀은 상태를 로드하지 않는다', async () => {
      repo.findUnique.mockResolvedValue(
        createMockBattle({
          status: BATTLE_STATUS.CLOSED,
          totalParticipantsCount: 10,
        }),
      )

      await useCase.getJoinBattleInfo('battle-1')

      expect(stateRepo.loadBattleState).not.toHaveBeenCalled()
    })
  })

  describe('getBattleResult', () => {
    it('배틀 결과를 반환한다', async () => {
      repo.findUnique.mockResolvedValue(
        createMockBattle({
          status: BATTLE_STATUS.CLOSED,
          teamACount: 5,
          teamBCount: 3,
          totalParticipantsCount: 8,
          winningTeam: 'A',
          finishedAt: new Date(),
          timeline: [],
          mvps: [],
          mvpsState: [],
        }),
      )

      const result = await useCase.getBattleResult('battle-1')

      expect(result.battleId).toBe('battle-1')
      expect(result.status).toBe('CLOSED')
    })

    it('진행 중인 배틀은 BadRequestException을 던진다', async () => {
      repo.findUnique.mockResolvedValue(createMockBattle({ status: BATTLE_STATUS.OPEN }))

      await expect(useCase.getBattleResult('battle-1')).rejects.toThrow(BadRequestException)
      await expect(useCase.getBattleResult('battle-1')).rejects.toThrow('배틀이 아직 진행 중입니다.')
    })
  })

  describe('isPrivateBattle', () => {
    it('비공개 배틀이면 true를 반환한다', async () => {
      repo.findUnique.mockResolvedValue(createMockBattle({ isPrivate: true }))

      const result = await useCase.isPrivateBattle('battle-1')

      expect(result).toBe(true)
    })

    it('공개 배틀이면 false를 반환한다', async () => {
      repo.findUnique.mockResolvedValue(createMockBattle({ isPrivate: false }))

      const result = await useCase.isPrivateBattle('battle-1')

      expect(result).toBe(false)
    })
  })
})
