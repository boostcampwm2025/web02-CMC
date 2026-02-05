import { ClosedBattleResponseDto } from './closedBattleResponse.dto'
import { Battle, FinishedBattleState } from '../domains/models/types/battle.types'
import { BattleResult } from '../domains/models/types/battleResult.types'
import { BATTLE_PLAYTIME, BATTLE_CATEGORY, BATTLE_STATUS, BATTLE_LANGUAGE, BATTLE_TYPE } from '../domains/models/const/battles.const'

describe('ClosedBattleResponseDto', () => {
  const mockResult: BattleResult = {
    winner: 'A',
    teamA: { votes: 5, percentage: 50 },
    teamB: { votes: 3, percentage: 30 },
    neutral: { votes: 2, percentage: 20 },
  }

  describe('of', () => {
    const baseDate = new Date('2024-01-01T00:00:00.000Z')

    const mockBattle: Battle = {
      id: 'battle-123',
      authorId: 'author-123',
      title: 'Test Battle',
      description: 'Test Description',
      aCode: 'const a = 1;',
      bCode: 'const b = 2;',
      language: BATTLE_LANGUAGE.TS,
      type: BATTLE_TYPE.PUBLIC,
      category: BATTLE_CATEGORY.ALGORITHM,
      playTime: BATTLE_PLAYTIME.FIFTEEN_MIN,
      topics: ['topic1', 'topic2'],
      status: BATTLE_STATUS.CLOSED,
      participantCount: 10,
      initialState: {
        round: 1,
        phase: 'PENDING',
        phaseCount: 0,
        timeRemainingSeconds: 0,
      },
      createdAt: baseDate,
      updatedAt: baseDate,
    }

    it('모든 배틀 필드가 포함된 DTO를 생성해야 한다', () => {
      const dto = ClosedBattleResponseDto.of(mockBattle, mockResult)

      expect(dto.id).toBe('battle-123')
      expect(dto.title).toBe('Test Battle')
      expect(dto.description).toBe('Test Description')
      expect(dto.category).toBe(BATTLE_CATEGORY.ALGORITHM)
      expect(dto.status).toBe(BATTLE_STATUS.CLOSED)
    })

    it('playTime으로부터 expiresAt을 올바르게 계산해야 한다 (FIFTEEN_MIN)', () => {
      const dto = ClosedBattleResponseDto.of(mockBattle, mockResult)

      // 15분 = 15 * 60 * 1000 = 900000ms
      const expectedExpiresAt = new Date(baseDate.getTime() + 15 * 60 * 1000)
      expect(dto.expiresAt).toEqual(expectedExpiresAt)
    })

    it('THIRTY_MIN playTime에서 expiresAt을 올바르게 계산해야 한다', () => {
      const thirtyMinBattle: Battle = {
        ...mockBattle,
        playTime: BATTLE_PLAYTIME.THIRTY_MIN,
      }

      const dto = ClosedBattleResponseDto.of(thirtyMinBattle, mockResult)

      // 30분 = 30 * 60 * 1000 = 1800000ms
      const expectedExpiresAt = new Date(baseDate.getTime() + 30 * 60 * 1000)
      expect(dto.expiresAt).toEqual(expectedExpiresAt)
    })

    it('createdAt을 올바르게 설정해야 한다', () => {
      const dto = ClosedBattleResponseDto.of(mockBattle, mockResult)

      expect(dto.createdAt).toEqual(baseDate)
    })

    it('result를 올바르게 설정해야 한다', () => {
      const dto = ClosedBattleResponseDto.of(mockBattle, mockResult)

      expect(dto.result).toEqual(mockResult)
      expect(dto.result.winner).toBe('A')
    })

    it('DRAW 결과를 올바르게 처리해야 한다', () => {
      const drawResult: BattleResult = {
        winner: 'DRAW',
        teamA: { votes: 5, percentage: 50 },
        teamB: { votes: 5, percentage: 50 },
        neutral: { votes: 0, percentage: 0 },
      }

      const dto = ClosedBattleResponseDto.of(mockBattle, drawResult)

      expect(dto.result.winner).toBe('DRAW')
    })

    it('B팀 승리 결과를 올바르게 처리해야 한다', () => {
      const bWinResult: BattleResult = {
        winner: 'B',
        teamA: { votes: 2, percentage: 20 },
        teamB: { votes: 8, percentage: 80 },
        neutral: { votes: 0, percentage: 0 },
      }

      const dto = ClosedBattleResponseDto.of(mockBattle, bWinResult)

      expect(dto.result.winner).toBe('B')
    })

    it('REFACTORING 카테고리를 올바르게 처리해야 한다', () => {
      const refactoringBattle: Battle = {
        ...mockBattle,
        category: BATTLE_CATEGORY.REFACTORING,
      }

      const dto = ClosedBattleResponseDto.of(refactoringBattle, mockResult)

      expect(dto.category).toBe(BATTLE_CATEGORY.REFACTORING)
    })
  })

  describe('fromFinished', () => {
    const mockFinishedState: FinishedBattleState = {
      battleId: 'finished-battle-123',
      authorId: 'author-123',
      title: 'Finished Battle',
      description: 'Finished Description',
      status: 'CLOSED',
      language: 'TS',
      category: 'ALGORITHM',
      playTime: 15,
      topics: ['topic1'],
      createdAt: '2024-01-01T00:00:00.000Z',
      finishedAt: '2024-01-01T00:15:00.000Z',
      codeA: 'const a = 1;',
      codeB: 'const b = 2;',
      result: mockResult,
      metrics: { totalParticipants: 10, totalViews: 15, strategiesCount: 5, totalChats: 100 },
      voteTimeline: [],
      timeline: [],
      mvps: [],
    }

    it('FinishedBattleState에서 DTO를 생성해야 한다', () => {
      const dto = ClosedBattleResponseDto.fromFinished(mockFinishedState)

      expect(dto.id).toBe('finished-battle-123')
      expect(dto.title).toBe('Finished Battle')
      expect(dto.description).toBe('Finished Description')
      expect(dto.category).toBe('ALGORITHM')
    })

    it('status를 CLOSED로 설정해야 한다', () => {
      const dto = ClosedBattleResponseDto.fromFinished(mockFinishedState)

      expect(dto.status).toBe('CLOSED')
    })

    it('날짜 변환을 올바르게 처리해야 한다', () => {
      const dto = ClosedBattleResponseDto.fromFinished(mockFinishedState)

      expect(dto.createdAt).toEqual(new Date('2024-01-01T00:00:00.000Z'))
      expect(dto.expiresAt).toEqual(new Date('2024-01-01T00:15:00.000Z'))
    })

    it('result를 올바르게 매핑해야 한다', () => {
      const dto = ClosedBattleResponseDto.fromFinished(mockFinishedState)

      expect(dto.result).toEqual(mockResult)
    })

    it('다른 카테고리를 올바르게 처리해야 한다', () => {
      const refactoringState: FinishedBattleState = {
        ...mockFinishedState,
        category: 'REFACTORING',
      }

      const dto = ClosedBattleResponseDto.fromFinished(refactoringState)

      expect(dto.category).toBe('REFACTORING')
    })

    it('다른 finishedAt 날짜를 올바르게 처리해야 한다', () => {
      const laterFinishState: FinishedBattleState = {
        ...mockFinishedState,
        finishedAt: '2024-01-01T00:30:00.000Z',
      }

      const dto = ClosedBattleResponseDto.fromFinished(laterFinishState)

      expect(dto.expiresAt).toEqual(new Date('2024-01-01T00:30:00.000Z'))
    })
  })
})
