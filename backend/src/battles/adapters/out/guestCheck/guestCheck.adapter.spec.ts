/* eslint-disable @typescript-eslint/unbound-method */
import { GuestCheckAdapter } from './guestCheck.adapter'
import type { OauthService } from '../../../../oauth/service/oauth.service'

describe('GuestCheckAdapter', () => {
  let adapter: GuestCheckAdapter
  let oauthService: jest.Mocked<OauthService>

  beforeEach(() => {
    oauthService = {
      isNicknameExists: jest.fn(),
    } as unknown as jest.Mocked<OauthService>
    adapter = new GuestCheckAdapter(oauthService)
  })

  describe('isNicknameExists', () => {
    it('닉네임이 존재하면 true를 반환한다', async () => {
      oauthService.isNicknameExists.mockResolvedValue(true)
      const result = await adapter.isNicknameExists('테스터')
      expect(result).toBe(true)
      expect(oauthService.isNicknameExists).toHaveBeenCalledWith('테스터')
    })

    it('닉네임이 없으면 false를 반환한다', async () => {
      oauthService.isNicknameExists.mockResolvedValue(false)
      const result = await adapter.isNicknameExists('새닉네임')
      expect(result).toBe(false)
    })
  })
})
