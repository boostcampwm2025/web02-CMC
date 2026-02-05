import { BattleResultResponseDto } from './battleResult.dto'
import { FinishedBattleState } from '../domains/models/types/battle.types'
import { BattleResult, Metrics, VoteTimeline, TimelineItem, Mvp } from '../domains/models/types/battleResult.types'
import { type Battle as PrismaBattle } from 'generated/prisma/client'

describe('BattleResultResponseDto', () => {
  const mockResult: BattleResult = {
    winner: 'A',
    teamA: { votes: 5, percentage: 50 },
    teamB: { votes: 3, percentage: 30 },
    neutral: { votes: 2, percentage: 20 },
  }

  const mockMetrics: Metrics = {
    totalParticipants: 10,
    totalViews: 15,
    strategiesCount: 5,
    totalChats: 100,
  }

  const mockVoteTimeline: VoteTimeline[] = [
    { turn: 1, teamAVotes: 3, teamBVotes: 2, neutralVotes: 5, timestamp: '2024-01-01T00:00:00.000Z' },
    { turn: 2, teamAVotes: 5, teamBVotes: 3, neutralVotes: 2, timestamp: '2024-01-01T00:10:00.000Z' },
  ]

  const mockTimeline: TimelineItem[] = [
    {
      id: 'timeline-1',
      type: 'ATTACK',
      author: { id: 'user-1', nickname: 'User1' },
      team: 'A',
      content: 'Attack content',
      turn: 1,
      upvotes: 5,
      createdAt: '2024-01-01T00:05:00.000Z',
    },
    {
      id: 'timeline-2',
      type: 'DEFENSE',
      author: { id: 'user-2', nickname: 'User2' },
      team: 'B',
      content: 'Defense content',
      turn: 1,
      upvotes: 3,
      createdAt: '2024-01-01T00:06:00.000Z',
    },
  ]

  const mockMvps: Mvp[] = [
    {
      userId: 'mvp-1',
      nickname: 'MVP1',
      team: 'A',
      score: 100,
      totalVotes: 10,
      opinionCount: 5,
      selectedOpinionCount: 3,
      joinedAt: 1704067200000,
    },
    {
      userId: 'mvp-2',
      nickname: 'MVP2',
      team: 'B',
      score: 80,
      totalVotes: 8,
      opinionCount: 4,
      selectedOpinionCount: 2,
      joinedAt: 1704067200000,
    },
  ]

  describe('fromEntity', () => {
    const mockFinishedBattleState: FinishedBattleState = {
      battleId: 'battle-123',
      authorId: 'author-123',
      title: 'Test Battle',
      description: 'Test Description',
      status: 'CLOSED',
      language: 'TS',
      category: 'ALGORITHM',
      playTime: 15,
      topics: ['topic1', 'topic2'],
      createdAt: '2024-01-01T00:00:00.000Z',
      finishedAt: '2024-01-01T00:15:00.000Z',
      codeA: 'const a = 1;',
      codeB: 'const b = 2;',
      result: mockResult,
      metrics: mockMetrics,
      voteTimeline: mockVoteTimeline,
      timeline: mockTimeline,
      mvps: mockMvps,
    }

    it('모든 필드가 올바르게 매핑된 DTO를 생성해야 한다', () => {
      const dto = BattleResultResponseDto.fromEntity(mockFinishedBattleState)

      expect(dto.battleId).toBe('battle-123')
      expect(dto.authorId).toBe('author-123')
      expect(dto.title).toBe('Test Battle')
      expect(dto.description).toBe('Test Description')
      expect(dto.status).toBe('CLOSED')
      expect(dto.language).toBe('TS')
      expect(dto.category).toBe('ALGORITHM')
      expect(dto.playTime).toBe(15)
      expect(dto.topics).toEqual(['topic1', 'topic2'])
      expect(dto.createdAt).toBe('2024-01-01T00:00:00.000Z')
      expect(dto.finishedAt).toBe('2024-01-01T00:15:00.000Z')
      expect(dto.codeA).toBe('const a = 1;')
      expect(dto.codeB).toBe('const b = 2;')
    })

    it('result를 올바르게 매핑해야 한다', () => {
      const dto = BattleResultResponseDto.fromEntity(mockFinishedBattleState)

      expect(dto.result).toEqual(mockResult)
      expect(dto.result.winner).toBe('A')
      expect(dto.result.teamA.votes).toBe(5)
      expect(dto.result.teamB.votes).toBe(3)
      expect(dto.result.neutral.votes).toBe(2)
    })

    it('metrics를 올바르게 매핑해야 한다', () => {
      const dto = BattleResultResponseDto.fromEntity(mockFinishedBattleState)

      expect(dto.metrics).toEqual(mockMetrics)
      expect(dto.metrics.totalParticipants).toBe(10)
      expect(dto.metrics.totalViews).toBe(15)
      expect(dto.metrics.strategiesCount).toBe(5)
      expect(dto.metrics.totalChats).toBe(100)
    })

    it('voteTimeline 배열을 올바르게 매핑해야 한다', () => {
      const dto = BattleResultResponseDto.fromEntity(mockFinishedBattleState)

      expect(dto.voteTimeline).toEqual(mockVoteTimeline)
      expect(dto.voteTimeline).toHaveLength(2)
      expect(dto.voteTimeline[0].turn).toBe(1)
      expect(dto.voteTimeline[1].turn).toBe(2)
    })

    it('timeline 아이템들을 올바르게 매핑해야 한다', () => {
      const dto = BattleResultResponseDto.fromEntity(mockFinishedBattleState)

      expect(dto.timeline).toEqual(mockTimeline)
      expect(dto.timeline).toHaveLength(2)
      expect(dto.timeline[0].type).toBe('ATTACK')
      expect(dto.timeline[1].type).toBe('DEFENSE')
    })

    it('mvps를 올바르게 매핑해야 한다', () => {
      const dto = BattleResultResponseDto.fromEntity(mockFinishedBattleState)

      expect(dto.mvps).toEqual(mockMvps)
      expect(dto.mvps).toHaveLength(2)
      expect(dto.mvps[0].nickname).toBe('MVP1')
      expect(dto.mvps[1].nickname).toBe('MVP2')
    })

    it('DRAW 승자를 올바르게 처리해야 한다', () => {
      const drawState: FinishedBattleState = {
        ...mockFinishedBattleState,
        result: {
          winner: 'DRAW',
          teamA: { votes: 5, percentage: 50 },
          teamB: { votes: 5, percentage: 50 },
          neutral: { votes: 0, percentage: 0 },
        },
      }

      const dto = BattleResultResponseDto.fromEntity(drawState)

      expect(dto.result.winner).toBe('DRAW')
    })

    it('B팀 승리를 올바르게 처리해야 한다', () => {
      const bWinnerState: FinishedBattleState = {
        ...mockFinishedBattleState,
        result: {
          winner: 'B',
          teamA: { votes: 3, percentage: 30 },
          teamB: { votes: 7, percentage: 70 },
          neutral: { votes: 0, percentage: 0 },
        },
      }

      const dto = BattleResultResponseDto.fromEntity(bWinnerState)

      expect(dto.result.winner).toBe('B')
    })

    it('빈 배열들을 올바르게 처리해야 한다', () => {
      const emptyState: FinishedBattleState = {
        ...mockFinishedBattleState,
        topics: [],
        voteTimeline: [],
        timeline: [],
        mvps: [],
      }

      const dto = BattleResultResponseDto.fromEntity(emptyState)

      expect(dto.topics).toEqual([])
      expect(dto.voteTimeline).toEqual([])
      expect(dto.timeline).toEqual([])
      expect(dto.mvps).toEqual([])
    })
  })

  describe('fromPrismaBattle', () => {
    const now = new Date('2024-01-01T00:00:00.000Z')
    const finishedAt = new Date('2024-01-01T00:15:00.000Z')

    const mockPrismaBattle: PrismaBattle = {
      id: 'prisma-battle-123',
      userId: 'prisma-user-123',
      title: 'Prisma Battle',
      description: 'Prisma Description',
      codeA: 'const prismaA = 1;',
      codeB: 'const prismaB = 2;',
      language: 'TS',
      category: 'REFACTORING',
      type: 'PUBLIC',
      playTime: 'FIFTEEN_MIN',
      topics: ['prisma-topic1', 'prisma-topic2'],
      status: 'CLOSED',
      inviteCode: 'invite123',
      teamACount: 5,
      teamBCount: 3,
      totalParticipantsCount: 10,
      referenceData: null,
      createdAt: now,
      updatedAt: now,
      finishedAt: finishedAt,
    }

    it('Prisma 배틀에서 모든 필드가 포함된 DTO를 생성해야 한다', () => {
      const dto = BattleResultResponseDto.fromPrismaBattle(mockPrismaBattle, mockResult, mockTimeline, mockMvps)

      expect(dto.battleId).toBe('prisma-battle-123')
      expect(dto.authorId).toBe('prisma-user-123')
      expect(dto.title).toBe('Prisma Battle')
      expect(dto.description).toBe('Prisma Description')
      expect(dto.status).toBe('CLOSED')
      expect(dto.language).toBe('TS')
      expect(dto.category).toBe('REFACTORING')
      expect(dto.topics).toEqual(['prisma-topic1', 'prisma-topic2'])
      expect(dto.codeA).toBe('const prismaA = 1;')
      expect(dto.codeB).toBe('const prismaB = 2;')
    })

    it('FIFTEEN_MIN에서 playTime을 올바르게 계산해야 한다', () => {
      const dto = BattleResultResponseDto.fromPrismaBattle(mockPrismaBattle, mockResult, mockTimeline, mockMvps)

      expect(dto.playTime).toBe(15)
    })

    it('THIRTY_MIN에서 playTime을 올바르게 계산해야 한다', () => {
      const thirtyMinBattle: PrismaBattle = {
        ...mockPrismaBattle,
        playTime: 'THIRTY_MIN',
      }

      const dto = BattleResultResponseDto.fromPrismaBattle(thirtyMinBattle, mockResult, mockTimeline, mockMvps)

      expect(dto.playTime).toBe(30)
    })

    it('finishedAt이 있을 때 해당 값을 사용해야 한다', () => {
      const dto = BattleResultResponseDto.fromPrismaBattle(mockPrismaBattle, mockResult, mockTimeline, mockMvps)

      expect(dto.finishedAt).toBe(finishedAt.toISOString())
    })

    it('finishedAt이 null일 때 updatedAt으로 대체해야 한다', () => {
      const noFinishedAtBattle: PrismaBattle = {
        ...mockPrismaBattle,
        finishedAt: null,
        updatedAt: new Date('2024-01-01T00:20:00.000Z'),
      }

      const dto = BattleResultResponseDto.fromPrismaBattle(noFinishedAtBattle, mockResult, mockTimeline, mockMvps)

      expect(dto.finishedAt).toBe('2024-01-01T00:20:00.000Z')
    })

    it('finishedAt과 updatedAt 모두 null일 때 createdAt으로 대체해야 한다', () => {
      const noFinishedOrUpdatedBattle: PrismaBattle = {
        ...mockPrismaBattle,
        finishedAt: null,
        updatedAt: null,
      }

      const dto = BattleResultResponseDto.fromPrismaBattle(noFinishedOrUpdatedBattle, mockResult, mockTimeline, mockMvps)

      expect(dto.finishedAt).toBe(now.toISOString())
    })

    it('metrics를 올바르게 계산해야 한다', () => {
      const dto = BattleResultResponseDto.fromPrismaBattle(mockPrismaBattle, mockResult, mockTimeline, mockMvps)

      expect(dto.metrics.totalParticipants).toBe(10)
      expect(dto.metrics.totalViews).toBe(10)
      expect(dto.metrics.strategiesCount).toBe(2) // timeline 길이
      expect(dto.metrics.totalChats).toBe(0)
    })

    it('teamACount와 teamBCount가 null일 때 0으로 처리해야 한다', () => {
      const nullCountsBattle: PrismaBattle = {
        ...mockPrismaBattle,
        teamACount: null,
        teamBCount: null,
        totalParticipantsCount: null,
      }

      const dto = BattleResultResponseDto.fromPrismaBattle(nullCountsBattle, mockResult, mockTimeline, mockMvps)

      expect(dto.metrics.totalParticipants).toBe(0)
      expect(dto.voteTimeline[0].neutralVotes).toBe(0)
    })

    it('voteTimeline을 올바르게 생성해야 한다', () => {
      const dto = BattleResultResponseDto.fromPrismaBattle(mockPrismaBattle, mockResult, mockTimeline, mockMvps)

      expect(dto.voteTimeline).toHaveLength(1)
      expect(dto.voteTimeline[0].turn).toBe(1)
      expect(dto.voteTimeline[0].teamAVotes).toBe(5)
      expect(dto.voteTimeline[0].teamBVotes).toBe(3)
      expect(dto.voteTimeline[0].neutralVotes).toBe(2) // 10 - 5 - 3
    })

    it('알 수 없는 playTime을 적절히 처리해야 한다', () => {
      const unknownPlayTimeBattle: PrismaBattle = {
        ...mockPrismaBattle,
        playTime: 'UNKNOWN_TIME' as any,
      }

      const dto = BattleResultResponseDto.fromPrismaBattle(unknownPlayTimeBattle, mockResult, mockTimeline, mockMvps)

      expect(dto.playTime).toBe(0)
    })

    it('result, timeline, mvps를 올바르게 매핑해야 한다', () => {
      const dto = BattleResultResponseDto.fromPrismaBattle(mockPrismaBattle, mockResult, mockTimeline, mockMvps)

      expect(dto.result).toEqual(mockResult)
      expect(dto.timeline).toEqual(mockTimeline)
      expect(dto.mvps).toEqual(mockMvps)
    })

    it('createdAt을 ISO 문자열로 변환해야 한다', () => {
      const dto = BattleResultResponseDto.fromPrismaBattle(mockPrismaBattle, mockResult, mockTimeline, mockMvps)

      expect(dto.createdAt).toBe(now.toISOString())
    })
  })
})
