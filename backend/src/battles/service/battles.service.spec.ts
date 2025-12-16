import { BattlesService } from './battles.service'
import { Battle } from '../types/battles.types'
import { BATTLE_TYPE, BATTLE_CATEGORY, BATTLE_PLAYTIME } from '../const/battles.const'

const createBattle = (overrides: Partial<Battle>): Battle => ({
  id: 'battle-id',
  authorId: 'user-1',
  title: 'title',
  description: 'description',
  aCode: 'a',
  bCode: 'b',
  language: 'TS',
  type: BATTLE_TYPE.PUBLIC,
  category: BATTLE_CATEGORY.ALGORITHM,
  playTime: BATTLE_PLAYTIME.TEN_MIN,
  status: 'PENDING',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  initialState: {
    round: 1,
    phase: 'WAITING_FOR_START',
    timeRemainingSeconds: 600,
  },
  ...overrides,
})

describe('', () => {
  let service: BattlesService

  beforeEach(() => {
    service = new BattlesService()
  })

  describe('getOpenBattles', () => {
    it('PUBLIC 이면서 PENDING 또는 IN_PROGRESS 상태인 배틀만 반환한다', () => {
      const battles: Battle[] = [
        createBattle({ status: 'PENDING' }),
        createBattle({ status: 'IN_PROGRESS' }),
        createBattle({ status: 'FINISHED' }),
        createBattle({ type: BATTLE_TYPE.PRIVATE, status: 'IN_PROGRESS' }),
      ]

      service.setBattlesForTest(battles)

      const result = service.getOpenBattles(10, 0)

      expect(result).toHaveLength(2)
      result.forEach(battle => {
        expect(battle.status).toBe('OPEN')
      })
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
        createBattle({ status: 'FINISHED' }),
        createBattle({ status: 'IN_PROGRESS' }),
        createBattle({ type: BATTLE_TYPE.PRIVATE, status: 'FINISHED' }),
      ]

      service.setBattlesForTest(battles)

      const result = service.getClosedBattles(10, 0)

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('CLOSED')
    })

    it('배틀 종료 시각 기준 최신 종료 순으로 정렬된다', () => {
      const shorter = createBattle({
        id: 'short',
        playTime: BATTLE_PLAYTIME.FIVE_MIN,
        status: 'FINISHED',
      })
      const longer = createBattle({
        id: 'long',
        playTime: BATTLE_PLAYTIME.THIRTY_MIN,
        status: 'FINISHED',
      })

      service.setBattlesForTest([shorter, longer])

      const result = service.getClosedBattles(10, 0)

      expect(result[0].id).toBe('long')
      expect(result[1].id).toBe('short')
    })
  })
})
