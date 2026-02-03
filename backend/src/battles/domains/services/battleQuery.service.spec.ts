import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { BattleQueryService } from './battleQuery.service'
import { BattleResultService } from './battleResult.service'
import { BattleTimelineService } from './battleTimeline.service'
import { BattleMvpService } from './battleMvp.service'
import { BATTLE_REPO_PORT, BATTLE_STATE_PORT, BATTLE_UTIL_PORT } from '../../application/ports/tokens'
import type { BattleRepoPort } from '../../application/ports/out/battleRepository.port'
import type { BattleStatePort } from '../../application/ports/out/battleState.port'
import type { BattleUtilPort } from '../../application/ports/out/battleUtil.port'
import { BATTLE_STATUS } from '../models/const/battles.const'

describe('BattleQueryService', () => {
  let service: BattleQueryService
  let repo: jest.Mocked<BattleRepoPort>
  let stateRepo: jest.Mocked<BattleStatePort>
  let utilPort: jest.Mocked<BattleUtilPort>
  let resultService: jest.Mocked<BattleResultService>
  let timelineService: jest.Mocked<BattleTimelineService>
  let mvpService: jest.Mocked<BattleMvpService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BattleQueryService,
        {
          provide: BATTLE_REPO_PORT,
          useValue: {
            findUnique: jest.fn(),
            findUniqueByInviteCode: jest.fn(),
            findBattleList: jest.fn(),
            countBattleList: jest.fn(),
          },
        },
        {
          provide: BATTLE_STATE_PORT,
          useValue: {
            loadBattleState: jest.fn(),
            parseMvpsState: jest.fn(),
          },
        },
        {
          provide: BATTLE_UTIL_PORT,
          useValue: {
            buildOpenBattleList: jest.fn(),
            buildClosedBattleList: jest.fn(),
            toBattleEntity: jest.fn(),
          },
        },
        {
          provide: BattleResultService,
          useValue: {
            buildBattleResult: jest.fn(),
          },
        },
        {
          provide: BattleTimelineService,
          useValue: {
            toTimeline: jest.fn(),
          },
        },
        {
          provide: BattleMvpService,
          useValue: {
            buildLegacyMvpsFromNicknames: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get(BattleQueryService)
    repo = module.get(BATTLE_REPO_PORT)
    stateRepo = module.get(BATTLE_STATE_PORT)
    utilPort = module.get(BATTLE_UTIL_PORT)
    resultService = module.get(BattleResultService)
    timelineService = module.get(BattleTimelineService)
    mvpService = module.get(BattleMvpService)
  })

  describe('isPrivateBattle', () => {
    it('비공개 배틀을 올바르게 확인한다', async () => {
      repo.findUnique.mockResolvedValue({
        id: 'battle-1',
        isPrivate: true,
      } as never)

      const result = await service.isPrivateBattle('battle-1')

      expect(result).toBe(true)
      expect(repo.findUnique).toHaveBeenCalledWith('battle-1')
    })
  })

  describe('getOpenBattles', () => {
    it('열린 배틀 목록을 반환한다', async () => {
      const mockRecords = [{ id: 'battle-1' }]
      repo.findBattleList.mockResolvedValue(mockRecords as never)
      repo.countBattleList.mockResolvedValue(1)
      utilPort.buildOpenBattleList.mockReturnValue(mockRecords)

      const result = await service.getOpenBattles(10, 0)

      expect(result.battles).toEqual(mockRecords)
      expect(result.meta).toEqual({ offset: 0, limit: 10, total: 1 })
    })
  })

  describe('getClosedBattles', () => {
    it('닫힌 배틀 목록을 반환한다', async () => {
      const mockRecords = [{ id: 'battle-1' }]
      repo.findBattleList.mockResolvedValue(mockRecords as never)
      repo.countBattleList.mockResolvedValue(1)
      utilPort.buildClosedBattleList.mockReturnValue(mockRecords)

      const result = await service.getClosedBattles(10, 0)

      expect(result.battles).toEqual(mockRecords)
      expect(result.meta).toEqual({ offset: 0, limit: 10, total: 1 })
    })
  })

  describe('getBattleResult', () => {
    it('배틀 결과를 반환한다', async () => {
      const mockBattle = {
        id: 'battle-1',
        userId: 'user-1',
        title: 'Test Battle',
        description: 'Test Description',
        language: 'TS',
        category: 'ALGORITHM',
        playTime: 'FIFTEEN_MIN',
        topics: ['효율성'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        finishedAt: new Date('2024-01-02'),
        codeA: 'codeA',
        codeB: 'codeB',
        status: BATTLE_STATUS.CLOSED,
        teamACount: 10,
        teamBCount: 8,
        totalParticipantsCount: 18,
        winningTeam: 'A',
        timeline: [],
        mvpsState: [],
        mvps: [],
      }

      repo.findUnique.mockResolvedValue(mockBattle as never)
      timelineService.toTimeline.mockReturnValue([])
      resultService.buildBattleResult.mockReturnValue({
        winner: 'A',
        teamA: { votes: 10, percentage: 55.6 },
        teamB: { votes: 8, percentage: 44.4 },
        neutral: { votes: 0, percentage: 0 },
      })
      stateRepo.parseMvpsState.mockReturnValue([])
      mvpService.buildLegacyMvpsFromNicknames.mockReturnValue([])

      const result = await service.getBattleResult('battle-1')

      expect(result.battleId).toBe('battle-1')
      expect(result.status).toBe('CLOSED')
    })

    it('진행 중인 배틀 조회 시 BadRequestException을 던진다', async () => {
      repo.findUnique.mockResolvedValue({
        id: 'battle-1',
        status: BATTLE_STATUS.OPEN,
      } as never)

      await expect(service.getBattleResult('battle-1')).rejects.toThrow(BadRequestException)
    })
  })

  describe('getBattleByInviteCode', () => {
    it('초대 코드로 배틀을 찾는다', async () => {
      repo.findUniqueByInviteCode.mockResolvedValue({
        id: 'battle-1',
        status: BATTLE_STATUS.OPEN,
      } as never)

      const result = await service.getBattleByInviteCode('test-code')

      expect(result.battleId).toBe('battle-1')
    })

    it('초대 코드가 없으면 BadRequestException을 던진다', async () => {
      await expect(service.getBattleByInviteCode('')).rejects.toThrow(BadRequestException)
    })

    it('존재하지 않는 초대 코드면 NotFoundException을 던진다', async () => {
      repo.findUniqueByInviteCode.mockResolvedValue(null)

      await expect(service.getBattleByInviteCode('invalid-code')).rejects.toThrow(NotFoundException)
    })

    it('종료된 배틀의 초대 코드면 BadRequestException을 던진다', async () => {
      repo.findUniqueByInviteCode.mockResolvedValue({
        id: 'battle-1',
        status: BATTLE_STATUS.CLOSED,
      } as never)

      await expect(service.getBattleByInviteCode('closed-code')).rejects.toThrow(BadRequestException)
    })
  })

  describe('getJoinBattleInfo', () => {
    it('배틀 참가 정보를 반환한다', async () => {
      const mockBattle = {
        id: 'battle-1',
        status: BATTLE_STATUS.OPEN,
        totalParticipantsCount: 5,
      }

      repo.findUnique.mockResolvedValue(mockBattle as never)
      stateRepo.loadBattleState.mockResolvedValue({
        state: {
          participants: new Map([['user-1', 'A']]),
        },
      } as never)
      utilPort.toBattleEntity.mockReturnValue({
        id: 'battle-1',
        participantCount: 1,
      } as never)

      const result = await service.getJoinBattleInfo('battle-1')

      expect(result).toBeDefined()
    })

    it('battleId가 없으면 BadRequestException을 던진다', async () => {
      await expect(service.getJoinBattleInfo('')).rejects.toThrow(BadRequestException)
    })
  })
})
