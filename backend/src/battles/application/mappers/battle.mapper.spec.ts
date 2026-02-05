import { BadRequestException } from '@nestjs/common'
import { toBattleEntity } from './battle.mapper'
import { BATTLE_TYPE, BATTLE_PHASE, BATTLE_PLAYTIME } from '../../domains/models/const/battles.const'

describe('battle.mapper', () => {
  const createMockRecord = (overrides = {}) => ({
    id: 'battle-1',
    userId: 'user-1',
    title: '테스트 배틀',
    description: '배틀 설명',
    codeA: 'const a = 1;',
    codeB: 'const b = 2;',
    language: 'javascript',
    category: 'algorithm',
    playTime: 'FIFTEEN_MIN',
    topics: ['topic1', 'topic2'],
    inviteCode: null,
    isPrivate: false,
    status: 'OPEN',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    referenceData: null,
    ...overrides,
  })

  describe('toBattleEntity', () => {
    it('Prisma 레코드를 Battle 엔티티로 변환한다', () => {
      const record = createMockRecord()

      const result = toBattleEntity(record, 5)

      expect(result.id).toBe('battle-1')
      expect(result.authorId).toBe('user-1')
      expect(result.title).toBe('테스트 배틀')
      expect(result.description).toBe('배틀 설명')
      expect(result.aCode).toBe('const a = 1;')
      expect(result.bCode).toBe('const b = 2;')
      expect(result.language).toBe('javascript')
      expect(result.category).toBe('algorithm')
      expect(result.topics).toEqual(['topic1', 'topic2'])
      expect(result.status).toBe('OPEN')
      expect(result.participantCount).toBe(5)
    })

    it('공개 배틀인 경우 type이 PUBLIC이다', () => {
      const record = createMockRecord({ isPrivate: false })

      const result = toBattleEntity(record, 0)

      expect(result.type).toBe(BATTLE_TYPE.PUBLIC)
    })

    it('비공개 배틀인 경우 type이 PRIVATE이다', () => {
      const record = createMockRecord({ isPrivate: true, inviteCode: 'INVITE123' })

      const result = toBattleEntity(record, 0)

      expect(result.type).toBe(BATTLE_TYPE.PRIVATE)
      expect(result.inviteCode).toBe('INVITE123')
    })

    it('inviteCode가 null이면 undefined로 변환한다', () => {
      const record = createMockRecord({ inviteCode: null })

      const result = toBattleEntity(record, 0)

      expect(result.inviteCode).toBeUndefined()
    })

    it('playTime을 올바르게 매핑한다', () => {
      const record = createMockRecord({ playTime: 'FIFTEEN_MIN' })

      const result = toBattleEntity(record, 0)

      expect(result.playTime).toBe(BATTLE_PLAYTIME.FIFTEEN_MIN)
    })

    it('THIRTY_MIN playTime을 올바르게 매핑한다', () => {
      const record = createMockRecord({ playTime: 'THIRTY_MIN' })

      const result = toBattleEntity(record, 0)

      expect(result.playTime).toBe(BATTLE_PLAYTIME.THIRTY_MIN)
    })

    it('올바르지 않은 playTime이면 BadRequestException을 던진다', () => {
      const record = createMockRecord({ playTime: 'INVALID_TIME' })

      expect(() => toBattleEntity(record, 0)).toThrow(BadRequestException)
      expect(() => toBattleEntity(record, 0)).toThrow('올바르지 않은 배틀 진행 시간입니다.')
    })

    it('initialState를 올바르게 설정한다', () => {
      const record = createMockRecord()

      const result = toBattleEntity(record, 0)

      expect(result.initialState.round).toBe(1)
      expect(result.initialState.phase).toBe(BATTLE_PHASE.OPINION_SHARE.name)
      expect(result.initialState.phaseCount).toBe(1)
    })

    it('updatedAt이 null이면 createdAt을 사용한다', () => {
      const createdAt = new Date('2024-01-01T00:00:00.000Z')
      const record = createMockRecord({ createdAt, updatedAt: null })

      const result = toBattleEntity(record, 0)

      expect(result.updatedAt).toEqual(createdAt)
    })

    it('referenceData를 포함한다', () => {
      const referenceData = { summary: 'AI 요약', keyPoints: ['point1'] }
      const record = createMockRecord({ referenceData })

      const result = toBattleEntity(record, 0)

      expect(result.referenceData).toEqual(referenceData)
    })
  })
})
