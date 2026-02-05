import { getBattleRoomId, shuffleTopics } from './battle.util'
import { BadRequestException } from '@nestjs/common'

describe('Battle Utils', () => {
  describe('getBattleRoomId', () => {
    it('팀이 없으면 전체 룸 ID를 반환한다', () => {
      expect(getBattleRoomId('battle-123')).toBe('battle:battle-123')
    })

    it('팀이 있으면 팀별 룸 ID를 반환한다', () => {
      expect(getBattleRoomId('battle-123', 'A')).toBe('battle:battle-123:A')
      expect(getBattleRoomId('battle-123', 'B')).toBe('battle:battle-123:B')
    })
  })

  describe('shuffleTopics', () => {
    it('FIFTEEN_MIN일 때 주제 1개를 그대로 반환한다', () => {
      const result = shuffleTopics(['주제1'], 'FIFTEEN_MIN')
      expect(result).toEqual(['주제1'])
    })

    it('THIRTY_MIN일 때 주제 2개를 셔플하여 반환한다', () => {
      const topics = ['주제1', '주제2']
      const result = shuffleTopics(topics, 'THIRTY_MIN')
      expect(result).toHaveLength(2)
      expect(result.sort()).toEqual(topics.sort())
    })

    it('원본 배열을 변경하지 않는다', () => {
      const topics = ['주제1', '주제2']
      const original = [...topics]
      shuffleTopics(topics, 'THIRTY_MIN')
      expect(topics).toEqual(original)
    })

    it('올바르지 않은 playTime이면 BadRequestException을 던진다', () => {
      expect(() => shuffleTopics(['주제1'], 'INVALID')).toThrow(BadRequestException)
    })

    it('주제 수가 라운드 수와 일치하지 않으면 BadRequestException을 던진다', () => {
      expect(() => shuffleTopics(['주제1', '주제2'], 'FIFTEEN_MIN')).toThrow(BadRequestException)
      expect(() => shuffleTopics(['주제1'], 'THIRTY_MIN')).toThrow(BadRequestException)
    })
  })
})
