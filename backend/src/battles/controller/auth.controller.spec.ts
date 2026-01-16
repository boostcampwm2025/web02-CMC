import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from '../service/auth.service'
import { BattlesService } from '../service/battles.service'
import { CreateGuestRequestDto } from '../dto/createGuestRequest.dto'
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
    isNicknameDuplicate: jest.fn(),
    registerGuest: jest.fn(),
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
      guestInfoMap: new Map(),
      round: 1,
      phase: BATTLE_PHASE.PENDING.name,
      phaseCount: 1,
      startedAt: null,
      expiredAt: null,
    }

    beforeEach(() => {
      mockBattlesService.getBattleState.mockReturnValue(mockBattleState)
      mockBattlesService.isNicknameDuplicate.mockReturnValue(false)
    })

    it('정상적으로 Guest를 생성한다', () => {
      const nickname = 'testUser'
      const trimmedNickname = nickname.trim()
      const mockGuest: GuestAccount = {
        id: 'client-id-1',
        nickname: trimmedNickname,
        createdAt: Date.now(),
      }

      mockAuthService.createGuest.mockReturnValue(mockGuest)

      const dto: CreateGuestRequestDto = { nickname }
      const result = controller.createGuest(battleId, dto)

      expect(result).toEqual(mockGuest)
      expect(mockBattlesService.getBattleState).toHaveBeenCalledWith(battleId)
      expect(mockBattlesService.isNicknameDuplicate).toHaveBeenCalledWith(battleId, trimmedNickname)
      expect(mockAuthService.createGuest).toHaveBeenCalledWith(trimmedNickname)
      expect(mockBattlesService.registerGuest).toHaveBeenCalledWith(battleId, mockGuest)
    })

    it('빈 닉네임이면 BadRequestException을 던진다', () => {
      const dto: CreateGuestRequestDto = { nickname: '   ' }

      expect(() => controller.createGuest(battleId, dto)).toThrow(BadRequestException)
      expect(mockAuthService.createGuest).not.toHaveBeenCalled()
      expect(mockBattlesService.registerGuest).not.toHaveBeenCalled()
    })

    it('배틀이 존재하지 않으면 NotFoundException을 던진다', () => {
      mockBattlesService.getBattleState.mockReturnValue(null)

      const dto: CreateGuestRequestDto = { nickname: 'testUser' }

      expect(() => controller.createGuest(battleId, dto)).toThrow(NotFoundException)
      expect(mockAuthService.createGuest).not.toHaveBeenCalled()
      expect(mockBattlesService.registerGuest).not.toHaveBeenCalled()
    })

    it('닉네임이 중복되면 BadRequestException을 던진다', () => {
      mockBattlesService.isNicknameDuplicate.mockReturnValue(true)

      const dto: CreateGuestRequestDto = { nickname: 'duplicateNickname' }

      expect(() => controller.createGuest(battleId, dto)).toThrow(BadRequestException)
      expect(mockAuthService.createGuest).not.toHaveBeenCalled()
      expect(mockBattlesService.registerGuest).not.toHaveBeenCalled()
    })

    it('닉네임 중복 체크 후 Guest를 생성하고 등록한다', () => {
      const nickname = 'testUser'
      const mockGuest: GuestAccount = {
        id: 'client-id-1',
        nickname: nickname,
        createdAt: Date.now(),
      }

      mockAuthService.createGuest.mockReturnValue(mockGuest)

      const dto: CreateGuestRequestDto = { nickname }
      controller.createGuest(battleId, dto)

      expect(mockBattlesService.getBattleState).toHaveBeenCalledTimes(1)
      expect(mockBattlesService.isNicknameDuplicate).toHaveBeenCalledTimes(1)
      expect(mockAuthService.createGuest).toHaveBeenCalledTimes(1)
      expect(mockBattlesService.registerGuest).toHaveBeenCalledTimes(1)

      const isNicknameDuplicateCallOrder = mockBattlesService.isNicknameDuplicate.mock.invocationCallOrder[0]
      const createGuestCallOrder = mockAuthService.createGuest.mock.invocationCallOrder[0]
      const registerGuestCallOrder = mockBattlesService.registerGuest.mock.invocationCallOrder[0]

      expect(isNicknameDuplicateCallOrder).toBeLessThan(createGuestCallOrder)
      expect(createGuestCallOrder).toBeLessThan(registerGuestCallOrder)
    })
  })
})
