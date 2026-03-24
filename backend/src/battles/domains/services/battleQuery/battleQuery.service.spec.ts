import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { BattleQueryService } from './battleQuery.service'
import { BattleResultService } from '../battleResult/battleResult.service'
import { BattleTimelineService } from '../battleTimeline/battleTimeline.service'
import { BattleMvpService } from '../battleMvp/battleMvp.service'
import { BATTLE_REPO_PORT, BATTLE_STATE_PORT } from '../../../application/ports/tokens'
import type { BattleRepoPort } from '../../../application/ports/out/battleRepository.port'
import type { BattleStatePort } from '../../../application/ports/out/battleState.port'
import { BATTLE_PHASE, BATTLE_STATUS, BATTLE_TEAM } from '../../models/const/battles.const'
import type { ActiveBattleState } from '../../models/types/battle.types'

describe('BattleQueryService', () => {
  let service: BattleQueryService
  let repo: jest.Mocked<BattleRepoPort>
  let stateRepo: jest.Mocked<BattleStatePort>
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
    resultService = module.get(BattleResultService)
    timelineService = module.get(BattleTimelineService)
    mvpService = module.get(BattleMvpService)
  })

  describe('isPrivateBattle', () => {
    it('returns whether battle is private', async () => {
      const findUniqueSpy = jest.spyOn(repo, 'findUnique')
      findUniqueSpy.mockResolvedValue({ id: 'battle-1', isPrivate: true } as never)

      await expect(service.isPrivateBattle('battle-1')).resolves.toBe(true)
      expect(findUniqueSpy).toHaveBeenCalledWith('battle-1')
    })
  })

  describe('getOpenBattles', () => {
    it('returns open battle list and meta', async () => {
      const mockRecords = [
        {
          id: 'battle-1',
          userId: 'user-1',
          title: 'Test Battle',
          description: 'Test Description',
          codeA: 'codeA',
          codeB: 'codeB',
          language: 'TS',
          category: 'ALGORITHM',
          playTime: 'FIFTEEN_MIN',
          topics: ['topic'],
          inviteCode: null,
          isPrivate: false,
          status: 'OPEN',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
      repo.findBattleList.mockResolvedValue(mockRecords as never)
      repo.countBattleList.mockResolvedValue(1)

      const result = await service.getOpenBattles(10, 0)

      expect(result.battles).toHaveLength(1)
      expect(result.meta).toEqual({ offset: 0, limit: 10, total: 1 })
    })
  })

  describe('getClosedBattles', () => {
    it('returns closed battle list and meta', async () => {
      const mockRecords = [
        {
          id: 'battle-1',
          userId: 'user-1',
          title: 'Test Battle',
          description: 'Test Description',
          codeA: 'codeA',
          codeB: 'codeB',
          language: 'TS',
          category: 'ALGORITHM',
          playTime: 'FIFTEEN_MIN',
          topics: ['topic'],
          inviteCode: null,
          isPrivate: false,
          status: 'CLOSED',
          createdAt: new Date(),
          updatedAt: new Date(),
          teamACount: 5,
          teamBCount: 3,
          totalParticipantsCount: 8,
          winningTeam: 'A',
        },
      ]
      repo.findBattleList.mockResolvedValue(mockRecords as never)
      repo.countBattleList.mockResolvedValue(1)
      resultService.buildBattleResult.mockReturnValue({
        winner: 'A',
        teamAVotes: 5,
        teamBVotes: 3,
        neutralVotes: 0,
      } as never)

      const result = await service.getClosedBattles(10, 0)

      expect(result.battles).toHaveLength(1)
      expect(result.meta).toEqual({ offset: 0, limit: 10, total: 1 })
    })
  })

  describe('getBattleResult', () => {
    it('returns battle result dto', async () => {
      const mockBattle = {
        id: 'battle-1',
        userId: 'user-1',
        title: 'Test Battle',
        description: 'Test Description',
        language: 'TS',
        category: 'ALGORITHM',
        playTime: 'FIFTEEN_MIN',
        topics: ['topic'],
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

      jest.spyOn(repo, 'findUnique').mockResolvedValue(mockBattle as never)
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

    it('throws BadRequestException when battle is not closed', async () => {
      jest.spyOn(repo, 'findUnique').mockResolvedValue({ id: 'battle-1', status: BATTLE_STATUS.OPEN } as never)

      await expect(service.getBattleResult('battle-1')).rejects.toThrow(BadRequestException)
    })
  })

  describe('getBattleByInviteCode', () => {
    it('returns battleId for valid invite code', async () => {
      repo.findUniqueByInviteCode.mockResolvedValue({ id: 'battle-1', status: BATTLE_STATUS.OPEN } as never)

      await expect(service.getBattleByInviteCode('test-code')).resolves.toEqual({ battleId: 'battle-1' })
    })

    it('throws BadRequestException when inviteCode is empty', async () => {
      await expect(service.getBattleByInviteCode('')).rejects.toThrow(BadRequestException)
    })

    it('throws NotFoundException when inviteCode does not exist', async () => {
      repo.findUniqueByInviteCode.mockResolvedValue(null)

      await expect(service.getBattleByInviteCode('invalid-code')).rejects.toThrow(NotFoundException)
    })

    it('throws BadRequestException when battle is already closed', async () => {
      repo.findUniqueByInviteCode.mockResolvedValue({ id: 'battle-1', status: BATTLE_STATUS.CLOSED } as never)

      await expect(service.getBattleByInviteCode('closed-code')).rejects.toThrow(BadRequestException)
    })
  })

  describe('getJoinBattleInfo', () => {
    it('returns join info dto', async () => {
      const mockBattleRecord = {
        id: 'battle-1',
        userId: 'user-1',
        title: 'Test Battle',
        description: 'Test Description',
        codeA: 'codeA',
        codeB: 'codeB',
        language: 'TS',
        category: 'ALGORITHM',
        playTime: 'FIFTEEN_MIN',
        topics: ['topic'],
        inviteCode: null,
        isPrivate: false,
        status: BATTLE_STATUS.OPEN,
        totalParticipantsCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const activeState: ActiveBattleState = {
        battleId: 'battle-1',
        status: 'OPEN',
        all: { roomId: 'battle:battle-1', chats: [], attacks: [], defenses: [] },
        teamA: { roomId: 'battle:battle-1:A', chats: [], users: [], attacks: [], defenses: [] },
        teamB: { roomId: 'battle:battle-1:B', chats: [], users: [], attacks: [], defenses: [] },
        participants: new Map([['user-1', BATTLE_TEAM.A]]),
        teamVotes: new Map(),
        userInfoMap: new Map(),
        opinionHistory: [],
        skipState: new Set(),
        round: 1,
        topics: ['topic'],
        totalRounds: 1,
        phase: BATTLE_PHASE.PENDING.name,
        phaseCount: 1,
        startedAt: null,
        expiredAt: null,
      }

      jest.spyOn(repo, 'findUnique').mockResolvedValue(mockBattleRecord as never)
      stateRepo.loadBattleState.mockResolvedValue({ state: activeState } as never)
      // toBattleEntity는 순수 함수이므로 mock 불필요

      const result = await service.getJoinBattleInfo('battle-1')

      expect(result).toEqual(
        expect.objectContaining({
          title: 'Test Battle',
          participantCount: 1,
          totalRounds: 1,
          currentRound: 1,
        }),
      )
    })

    it('throws BadRequestException when battleId is empty', async () => {
      await expect(service.getJoinBattleInfo('')).rejects.toThrow(BadRequestException)
    })
  })
})
