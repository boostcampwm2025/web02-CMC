import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from '../service/auth.service'
import { BattlesService } from '../service/battles.service'
import { OauthService } from '../../oauth/service/oauth.service'
import { GuestAccount } from '../types/auth.types'
import { ActiveBattleState } from '../types/battles.types'
import { BATTLE_PHASE } from '../const/battles.const'

describe('AuthController', () => {
  let controller: AuthController

  const mockAuthService = {
    createGuest: jest.fn(),
  }

  const mockBattlesService = {
    getBattleState: jest.fn(),
    generateGuestNickname: jest.fn(),
    registerGuest: jest.fn(),
  }

  const mockOauthService = {
    isNicknameExists: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: BattlesService,
          useValue: mockBattlesService,
        },
        {
          provide: OauthService,
          useValue: mockOauthService,
        },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)

    jest.clearAllMocks()
  })

  describe('createGuest', () => {
    const battleId = 'battle-1'
    const mockBattleState: Partial<ActiveBattleState> = {
      battleId: 'battle-1',
      participants: new Map(),
      teamVotes: new Map(),
      userInfoMap: new Map(),
      round: 1,
      phase: BATTLE_PHASE.PENDING.name,
      phaseCount: 1,
      startedAt: null,
      expiredAt: null,
    }

    beforeEach(() => {
      mockBattlesService.getBattleState.mockResolvedValue({ battleState: mockBattleState })
      mockOauthService.isNicknameExists.mockResolvedValue(false)
    })

    it('정상적으로 Guest를 생성한다', async () => {
      const mockNickname = '심심한 레오'
      const mockGuest: GuestAccount = {
        id: 'client-id-1',
        nickname: mockNickname,
        createdAt: Date.now(),
      }

      mockBattlesService.generateGuestNickname.mockResolvedValue(mockNickname)
      mockAuthService.createGuest.mockReturnValue(mockGuest)

      const result = await controller.createGuest(battleId)

      expect(result).toEqual(mockGuest)
      expect(mockBattlesService.getBattleState).toHaveBeenCalledWith(battleId)
      expect(mockBattlesService.generateGuestNickname).toHaveBeenCalledWith(battleId, expect.any(Function))
      expect(mockAuthService.createGuest).toHaveBeenCalledWith(mockNickname)
      expect(mockBattlesService.registerGuest).toHaveBeenCalledWith(battleId, mockGuest)
    })

    it('배틀이 존재하지 않으면 NotFoundException을 던진다', async () => {
      mockBattlesService.getBattleState.mockRejectedValue(new NotFoundException())

      await expect(controller.createGuest(battleId)).rejects.toThrow(NotFoundException)
      expect(mockAuthService.createGuest).not.toHaveBeenCalled()
      expect(mockBattlesService.registerGuest).not.toHaveBeenCalled()
    })

    it('OAuth 사용자 닉네임과 중복되지 않는 닉네임을 생성한다', async () => {
      const mockNickname = '심심한 레오'
      const mockGuest: GuestAccount = {
        id: 'client-id-1',
        nickname: mockNickname,
        createdAt: Date.now(),
      }

      // OAuth 닉네임 체크 함수가 올바르게 전달되는지 확인
      let capturedIsTaken: ((nickname: string) => boolean | Promise<boolean>) | undefined
      mockBattlesService.generateGuestNickname.mockImplementation(
        async (battleId: string, isTaken: (nickname: string) => boolean | Promise<boolean>) => {
        capturedIsTaken = isTaken
        return mockNickname
      })
      mockAuthService.createGuest.mockReturnValue(mockGuest)

      await controller.createGuest(battleId)

      expect(capturedIsTaken).toBeDefined()
      if (!capturedIsTaken) {
        throw new Error('isTaken function was not captured')
      }

      // isTaken 함수가 OAuth 서비스를 올바르게 호출하는지 확인
      mockOauthService.isNicknameExists.mockResolvedValue(true)
      await expect(capturedIsTaken('existing-nickname')).resolves.toBe(true)

      mockOauthService.isNicknameExists.mockResolvedValue(false)
      await expect(capturedIsTaken('new-nickname')).resolves.toBe(false)
    })

    it('Guest 생성 후 배틀에 등록한다', async () => {
      const mockNickname = '심심한 레오'
      const mockGuest: GuestAccount = {
        id: 'client-id-1',
        nickname: mockNickname,
        createdAt: Date.now(),
      }

      mockBattlesService.generateGuestNickname.mockResolvedValue(mockNickname)
      mockAuthService.createGuest.mockReturnValue(mockGuest)

      await controller.createGuest(battleId)

      expect(mockBattlesService.getBattleState).toHaveBeenCalledTimes(1)
      expect(mockBattlesService.generateGuestNickname).toHaveBeenCalledTimes(1)
      expect(mockAuthService.createGuest).toHaveBeenCalledTimes(1)
      expect(mockBattlesService.registerGuest).toHaveBeenCalledTimes(1)

      const generateNicknameCallOrder = mockBattlesService.generateGuestNickname.mock.invocationCallOrder[0]
      const createGuestCallOrder = mockAuthService.createGuest.mock.invocationCallOrder[0]
      const registerGuestCallOrder = mockBattlesService.registerGuest.mock.invocationCallOrder[0]

      expect(generateNicknameCallOrder).toBeLessThan(createGuestCallOrder)
      expect(createGuestCallOrder).toBeLessThan(registerGuestCallOrder)
    })
  })
})
