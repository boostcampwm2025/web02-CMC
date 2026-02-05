import { generateNickname, isGuestNicknamePattern } from './nickname.util'

describe('Nickname Utils', () => {
  describe('generateNickname', () => {
    it('문자열을 반환한다', () => {
      const nickname = generateNickname()
      expect(typeof nickname).toBe('string')
      expect(nickname.length).toBeGreaterThan(0)
    })

    it('8자 이하의 닉네임을 반환한다', () => {
      for (let i = 0; i < 100; i++) {
        const nickname = generateNickname()
        expect(nickname.length).toBeLessThanOrEqual(8)
      }
    })

    it('공백으로 구분된 형식을 가진다', () => {
      for (let i = 0; i < 50; i++) {
        const nickname = generateNickname()
        expect(nickname).toContain(' ')
      }
    })
  })

  describe('isGuestNicknamePattern', () => {
    it('공백이 포함된 닉네임은 게스트 패턴으로 판단한다', () => {
      expect(isGuestNicknamePattern('귀여운 레오')).toBe(true)
      expect(isGuestNicknamePattern('아무 이름')).toBe(true)
    })

    it('형용사+명사 조합이 포함되면 게스트 패턴으로 판단한다', () => {
      expect(isGuestNicknamePattern('귀여운레오')).toBe(true)
      expect(isGuestNicknamePattern('멋진스티브')).toBe(true)
    })

    it('형용사만 포함된 경우 게스트 패턴이 아니다', () => {
      expect(isGuestNicknamePattern('귀여운사람')).toBe(false)
    })

    it('명사만 포함된 경우 게스트 패턴이 아니다', () => {
      expect(isGuestNicknamePattern('레오짱')).toBe(false)
    })

    it('관련 없는 닉네임은 게스트 패턴이 아니다', () => {
      expect(isGuestNicknamePattern('홍길동')).toBe(false)
      expect(isGuestNicknamePattern('TestUser')).toBe(false)
    })
  })
})
