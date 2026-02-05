import { BattleIdentifierAdapter } from './battleIdentifier.adapter'

describe('BattleIdentifierAdapter', () => {
  let adapter: BattleIdentifierAdapter

  beforeEach(() => {
    adapter = new BattleIdentifierAdapter()
  })

  describe('generateId', () => {
    it('UUID v7 문자열을 반환한다', () => {
      const id = adapter.generateId()
      expect(typeof id).toBe('string')
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })

    it('호출마다 고유한 ID를 생성한다', () => {
      const ids = new Set(Array.from({ length: 100 }, () => adapter.generateId()))
      expect(ids.size).toBe(100)
    })
  })

  describe('generateInviteCode', () => {
    it('문자열을 반환한다', () => {
      const code = adapter.generateInviteCode()
      expect(typeof code).toBe('string')
      expect(code.length).toBeGreaterThan(0)
    })

    it('타임스탬프 기반 코드를 반환한다', () => {
      const code = adapter.generateInviteCode()
      const parsed = Number(code)
      expect(Number.isNaN(parsed)).toBe(false)
      expect(parsed).toBeGreaterThan(0)
    })
  })
})
