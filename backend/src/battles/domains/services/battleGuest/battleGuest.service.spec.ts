import { BattleGuestService } from './battleGuest.service'
import type { ActiveBattleState } from '../../models/types/battle.types'
import { BATTLE_TEAM } from '../../models/const/battles.const'

describe('BattleGuestService', () => {
  let service: BattleGuestService

  beforeEach(() => {
    service = new BattleGuestService()
  })

  describe('buildGuest', () => {
    it('ID 생성 함수를 사용하여 게스트 계정을 생성한다', () => {
      const generateId = jest.fn().mockReturnValue('guest-123')
      const guest = service.buildGuest('테스트닉네임', generateId)

      expect(generateId).toHaveBeenCalled()
      expect(guest.id).toBe('guest-123')
      expect(guest.nickname).toBe('테스트닉네임')
      expect(guest.createdAt).toBeDefined()
    })

    it('생성 시점의 타임스탬프를 포함한다', () => {
      const before = Date.now()
      const guest = service.buildGuest('닉네임', () => 'id')
      const after = Date.now()

      expect(guest.createdAt).toBeGreaterThanOrEqual(before)
      expect(guest.createdAt).toBeLessThanOrEqual(after)
    })
  })

  describe('applyGuestToState', () => {
    it('게스트를 배틀 상태에 NONE 팀으로 추가한다', () => {
      const state = {
        userInfoMap: new Map<string, string>(),
        participants: new Map<string, string>(),
      } as unknown as ActiveBattleState

      const guest = { id: 'guest-1', nickname: '게스트', createdAt: Date.now() }
      service.applyGuestToState(state, guest)

      expect(state.userInfoMap.get('guest-1')).toBe('게스트')
      expect(state.participants.get('guest-1')).toBe(BATTLE_TEAM.NONE)
    })
  })

  describe('buildGuestNickname', () => {
    it('중복이 없으면 첫 번째 생성된 닉네임을 반환한다', async () => {
      const isTaken = jest.fn().mockResolvedValue(false)
      const isNicknameDuplicate = jest.fn().mockResolvedValue(false)

      const nickname = await service.buildGuestNickname('battle-1', isTaken, isNicknameDuplicate)

      expect(typeof nickname).toBe('string')
      expect(nickname.length).toBeGreaterThan(0)
    })

    it('중복이 있으면 다른 닉네임으로 재시도한다', async () => {
      let callCount = 0
      const isTaken = jest.fn().mockImplementation(() => {
        callCount++
        return Promise.resolve(callCount <= 2)
      })
      const isNicknameDuplicate = jest.fn().mockResolvedValue(false)

      const nickname = await service.buildGuestNickname('battle-1', isTaken, isNicknameDuplicate)

      expect(typeof nickname).toBe('string')
      expect(isTaken).toHaveBeenCalledTimes(3)
    })

    it('50회 초과 시 타임스탬프 기반 폴백 닉네임을 반환한다', async () => {
      const isTaken = jest.fn().mockResolvedValue(true)
      const isNicknameDuplicate = jest.fn().mockResolvedValue(false)

      const nickname = await service.buildGuestNickname('battle-1', isTaken, isNicknameDuplicate)

      expect(nickname).toMatch(/^게스트\d+$/)
    })

    it('배틀 내 닉네임 중복도 체크한다', async () => {
      let callCount = 0
      const isTaken = jest.fn().mockResolvedValue(false)
      const isNicknameDuplicate = jest.fn().mockImplementation(() => {
        callCount++
        return Promise.resolve(callCount <= 1)
      })

      await service.buildGuestNickname('battle-1', isTaken, isNicknameDuplicate)

      expect(isNicknameDuplicate).toHaveBeenCalledWith('battle-1', expect.any(String))
    })
  })
})
