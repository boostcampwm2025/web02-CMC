import { BattleTimelineService } from './battleTimeline.service'
import type { ActiveBattleState, BattleDiscussion } from '../../models/types/battle.types'

describe('BattleTimelineService', () => {
  let service: BattleTimelineService

  beforeEach(() => {
    service = new BattleTimelineService()
  })

  const createDiscussion = (overrides: Partial<BattleDiscussion> = {}): BattleDiscussion => ({
    discussionId: 'disc-1',
    author: { authorId: 'user-1', nickname: '테스터' },
    team: 'A',
    content: '이의제기 내용',
    upvotes: 5,
    selectedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  })

  const createState = (attacks: (BattleDiscussion | null)[] = [], defenses: (BattleDiscussion | null)[] = []): ActiveBattleState =>
    ({
      all: { attacks, defenses },
    }) as unknown as ActiveBattleState

  describe('buildTimeline', () => {
    it('빈 상태에서 빈 타임라인을 반환한다', () => {
      const state = createState([], [])
      const result = service.buildTimeline(state)
      expect(result).toEqual([])
    })

    it('공격 토론을 타임라인 아이템으로 변환한다', () => {
      const attack = createDiscussion({ discussionId: 'atk-1', team: 'A' })
      const state = createState([attack], [])
      const result = service.buildTimeline(state)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'atk-1',
        type: 'ATTACK',
        author: { id: 'user-1', nickname: '테스터' },
        team: 'A',
        content: '이의제기 내용',
        turn: 1,
        upvotes: 5,
      })
    })

    it('방어 토론을 타임라인 아이템으로 변환한다', () => {
      const defense = createDiscussion({ discussionId: 'def-1', team: 'B' })
      const state = createState([], [defense])
      const result = service.buildTimeline(state)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'def-1',
        type: 'DEFENSE',
        team: 'B',
      })
    })

    it('null 토론은 필터링한다', () => {
      const attack = createDiscussion({ discussionId: 'atk-1' })
      const state = createState([null, attack, null], [null])
      const result = service.buildTimeline(state)

      expect(result).toHaveLength(1)
    })

    it('생성시간 기준으로 정렬한다', () => {
      const attack = createDiscussion({ discussionId: 'atk-1', selectedAt: '2025-01-01T00:01:00.000Z' })
      const defense = createDiscussion({ discussionId: 'def-1', selectedAt: '2025-01-01T00:00:30.000Z' })
      const state = createState([attack], [defense])
      const result = service.buildTimeline(state)

      expect(result[0].id).toBe('def-1')
      expect(result[1].id).toBe('atk-1')
    })

    it('turn 번호를 인덱스 기반으로 계산한다', () => {
      const atk1 = createDiscussion({ discussionId: 'atk-1', selectedAt: '2025-01-01T00:00:00.000Z' })
      const atk2 = createDiscussion({ discussionId: 'atk-2', selectedAt: '2025-01-01T00:01:00.000Z' })
      const atk3 = createDiscussion({ discussionId: 'atk-3', selectedAt: '2025-01-01T00:02:00.000Z' })
      const state = createState([atk1, atk2, atk3], [])
      const result = service.buildTimeline(state)

      expect(result[0].turn).toBe(1) // index 0: floor(0/2)+1
      expect(result[1].turn).toBe(1) // index 1: floor(1/2)+1
      expect(result[2].turn).toBe(2) // index 2: floor(2/2)+1
    })
  })

  describe('toTimeline', () => {
    it('배열이 아닌 값은 빈 배열을 반환한다', () => {
      expect(service.toTimeline(null)).toEqual([])
      expect(service.toTimeline(undefined)).toEqual([])
      expect(service.toTimeline('string')).toEqual([])
      expect(service.toTimeline(123)).toEqual([])
    })

    it('배열은 그대로 반환한다', () => {
      const timeline = [{ id: '1', type: 'ATTACK' }]
      expect(service.toTimeline(timeline)).toEqual(timeline)
    })

    it('빈 배열은 빈 배열을 반환한다', () => {
      expect(service.toTimeline([])).toEqual([])
    })
  })
})
