import { BattleTimerAdapter } from './battleTimer.adapter'
import type { ActiveBattleState } from '../../../domains/models/types/battle.types'

describe('BattleTimerAdapter', () => {
  let adapter: BattleTimerAdapter

  beforeEach(() => {
    jest.useFakeTimers()
    adapter = new BattleTimerAdapter()
  })

  afterEach(() => {
    adapter.clear()
    jest.useRealTimers()
  })

  const createState = (expiredAt: number | null): ActiveBattleState => ({ expiredAt }) as unknown as ActiveBattleState

  describe('schedule', () => {
    it('expiredAt이 null이면 타이머를 설정하지 않는다', () => {
      const updatePhase = jest.fn()
      adapter.schedule('battle-1', createState(null), updatePhase)
      jest.advanceTimersByTime(10000)
      expect(updatePhase).not.toHaveBeenCalled()
    })

    it('만료 시간 후 updatePhase를 호출한다', () => {
      const updatePhase = jest.fn().mockResolvedValue(undefined)
      const now = Date.now()
      adapter.schedule('battle-1', createState(now + 5000), updatePhase)

      jest.advanceTimersByTime(4999)
      expect(updatePhase).not.toHaveBeenCalled()

      jest.advanceTimersByTime(1)
      expect(updatePhase).toHaveBeenCalledWith('battle-1')
    })

    it('이전 타이머를 취소하고 새 타이머를 설정한다', () => {
      const updatePhase1 = jest.fn().mockResolvedValue(undefined)
      const updatePhase2 = jest.fn().mockResolvedValue(undefined)
      const now = Date.now()

      adapter.schedule('battle-1', createState(now + 5000), updatePhase1)
      adapter.schedule('battle-1', createState(now + 3000), updatePhase2)

      jest.advanceTimersByTime(3000)
      expect(updatePhase1).not.toHaveBeenCalled()
      expect(updatePhase2).toHaveBeenCalledWith('battle-1')
    })

    it('이미 만료된 시간이면 즉시 실행한다', () => {
      const updatePhase = jest.fn().mockResolvedValue(undefined)
      const pastTime = Date.now() - 1000
      adapter.schedule('battle-1', createState(pastTime), updatePhase)

      jest.advanceTimersByTime(0)
      expect(updatePhase).toHaveBeenCalledWith('battle-1')
    })
  })

  describe('cancel', () => {
    it('해당 배틀의 타이머를 취소한다', () => {
      const updatePhase = jest.fn().mockResolvedValue(undefined)
      const now = Date.now()
      adapter.schedule('battle-1', createState(now + 5000), updatePhase)

      adapter.cancel('battle-1')
      jest.advanceTimersByTime(10000)
      expect(updatePhase).not.toHaveBeenCalled()
    })

    it('존재하지 않는 배틀을 취소해도 에러가 발생하지 않는다', () => {
      expect(() => adapter.cancel('nonexistent')).not.toThrow()
    })
  })

  describe('clear', () => {
    it('모든 타이머를 취소한다', () => {
      const updatePhase = jest.fn().mockResolvedValue(undefined)
      const now = Date.now()
      adapter.schedule('battle-1', createState(now + 5000), updatePhase)
      adapter.schedule('battle-2', createState(now + 5000), updatePhase)

      adapter.clear()
      jest.advanceTimersByTime(10000)
      expect(updatePhase).not.toHaveBeenCalled()
    })
  })
})
