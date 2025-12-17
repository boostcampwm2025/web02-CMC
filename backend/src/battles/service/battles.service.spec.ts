import { NotFoundException, BadRequestException } from '@nestjs/common'
import { Battle } from '../types/battles.types'
import { BattlesService } from './battles.service'
import { BATTLE_TYPE, BATTLE_CATEGORY, BATTLE_PLAYTIME, BATTLE_LANGUAGE, BATTLE_STATUS, BATTLE_PHASE } from '../const/battles.const'

const createBattle = (overrides: Partial<Battle>): Battle => ({
  id: 'battle-id',
  authorId: 'user-1',
  title: 'title',
  description: 'description',
  aCode: 'a',
  bCode: 'b',
  language: BATTLE_LANGUAGE.TS,
  type: BATTLE_TYPE.PUBLIC,
  category: BATTLE_CATEGORY.ALGORITHM,
  playTime: BATTLE_PLAYTIME.TEN_MIN,
  status: BATTLE_STATUS.OPEN,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  participantCount: 0,
  initialState: {
    round: 1,
    phase: BATTLE_PHASE.WAITING_FOR_START,
    timeRemainingSeconds: 600,
  },
  ...overrides,
})

describe('BattlesService', () => {
  let service: BattlesService

  beforeEach(() => {
    service = new BattlesService()
  })

  describe('getOpenBattles', () => {
    it('PUBLIC 이면서 OPEN 상태인 배틀만 반환한다', () => {
      const battles: Battle[] = [
        createBattle({ status: BATTLE_STATUS.OPEN }),
        createBattle({ status: BATTLE_STATUS.CLOSED }),
        createBattle({ type: BATTLE_TYPE.PRIVATE, status: BATTLE_STATUS.OPEN }),
      ]

      service.setBattlesForTest(battles)

      const result = service.getOpenBattles(10, 0)

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe(BATTLE_STATUS.OPEN)
    })

    it('배틀 생성 시간 기준 최신순으로 정렬된다', () => {
      const battles = [createBattle({ id: 'old', createdAt: new Date('2024-01-01') }), createBattle({ id: 'new', createdAt: new Date('2024-01-02') })]

      service.setBattlesForTest(battles)

      const result = service.getOpenBattles(10, 0)

      expect(result[0].id).toBe('new')
      expect(result[1].id).toBe('old')
    })

    it('정렬된 결과에 대해 limit / offset 이 적용된다', () => {
      const battles = [
        createBattle({ id: '1', createdAt: new Date('2024-01-01') }),
        createBattle({ id: '2', createdAt: new Date('2024-01-02') }),
        createBattle({ id: '3', createdAt: new Date('2024-01-03') }),
      ]

      service.setBattlesForTest(battles)

      const result = service.getOpenBattles(1, 1)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })
  })

  describe('getClosedBattles', () => {
    it('PUBLIC 이면서 FINISHED 상태인 배틀만 반환한다', () => {
      const battles: Battle[] = [
        createBattle({ status: BATTLE_STATUS.CLOSED }),
        createBattle({ status: BATTLE_STATUS.OPEN }),
        createBattle({ type: BATTLE_TYPE.PRIVATE, status: BATTLE_STATUS.CLOSED }),
      ]

      service.setBattlesForTest(battles)

      const result = service.getClosedBattles(10, 0)

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe(BATTLE_STATUS.CLOSED)
    })

    it('배틀 종료 시각 기준 최신 종료 순으로 정렬된다', () => {
      const shorter = createBattle({
        id: 'short',
        playTime: BATTLE_PLAYTIME.FIVE_MIN,
        status: BATTLE_STATUS.CLOSED,
      })
      const longer = createBattle({
        id: 'long',
        playTime: BATTLE_PLAYTIME.THIRTY_MIN,
        status: BATTLE_STATUS.CLOSED,
      })

      service.setBattlesForTest([shorter, longer])

      const result = service.getClosedBattles(10, 0)

      expect(result[0].id).toBe('long')
      expect(result[1].id).toBe('short')
    })
  })

  describe('getBattleResult', () => {
    it('종료된 배틀의 결과를 반환해야 함', () => {
      const result = service.getBattleResult('battle-1')
      expect(result.battleId).toBe('battle-1')
      expect(result.status).toBe('CLOSED')
      expect(result).toHaveProperty('codeA')
      expect(result).toHaveProperty('codeB')
      expect(result).toHaveProperty('result')
      expect(result).toHaveProperty('metrics')
      expect(result).toHaveProperty('voteTimeline')
      expect(result).toHaveProperty('timeline')
      expect(result).toHaveProperty('mvp')
    })

    it('존재하지 않는 배틀 조회 시 NotFoundException을 던져야 함', () => {
      expect(() => service.getBattleResult('battle-999')).toThrow(NotFoundException)
    })

    it('진행 중인 배틀 조회 시 BadRequestException을 던져야 함', () => {
      expect(() => service.getBattleResult('battle-open-1')).toThrow(BadRequestException)
    })

    it('투표 비율이 올바르게 계산되어야 함', () => {
      const result = service.getBattleResult('battle-1')
      expect(result.result.teamA.percentage).toBe(44)
      expect(result.result.teamB.percentage).toBe(40)
      expect(result.result.neutral.percentage).toBe(16)
    })

    it('타임라인이 시간순(오래된순)으로 정렬되어야 함', () => {
      const result = service.getBattleResult('battle-1')
      const timestamps = result.timeline.map(item => new Date(item.createdAt).getTime())
      const sortedTimestamps = [...timestamps].sort((a, b) => a - b)
      expect(timestamps).toEqual(sortedTimestamps)
    })

    it('MVP가 올바르게 계산되어야 함 (최다 upvotes)', () => {
      const result = service.getBattleResult('battle-1')
      expect(result.mvp.nickname).toBe('CodeMaster')
      expect(result.mvp.totalVotes).toBe(25)
      expect(result.mvp.team).toBe('A')
    })

    it('투표 추세가 누적값으로 반환되어야 함', () => {
      const result = service.getBattleResult('battle-1')
      // 턴 1 < 턴 2 < 턴 3 (누적값 증가)
      expect(result.voteTimeline[0].teamAVotes).toBeLessThan(result.voteTimeline[1].teamAVotes)
      expect(result.voteTimeline[1].teamAVotes).toBeLessThan(result.voteTimeline[2].teamAVotes)
    })

    it('타임라인에 ATTACK과 DEFENSE만 포함되어야 함', () => {
      const result = service.getBattleResult('battle-1')
      result.timeline.forEach(item => {
        expect(['ATTACK', 'DEFENSE']).toContain(item.type)
      })
    })
  })
})
