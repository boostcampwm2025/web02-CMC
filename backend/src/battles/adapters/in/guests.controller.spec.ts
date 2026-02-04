import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { GuestController } from './guests.controller'
import { CreateGuestUseCase } from '../../application/usecases/createGuest.usecase'
import { GuestAccount } from '../../domains/models/types/auth.types'

describe('GuestController', () => {
  let controller: GuestController

  const mockCreateGuestUseCase = {
    execute: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuestController],
      providers: [
        {
          provide: CreateGuestUseCase,
          useValue: mockCreateGuestUseCase,
        },
      ],
    }).compile()

    controller = module.get<GuestController>(GuestController)

    jest.clearAllMocks()
  })

  describe('createGuest', () => {
    const battleId = 'battle-1'

    it('정상적으로 Guest를 생성한다', async () => {
      const mockGuest: GuestAccount = {
        id: 'client-id-1',
        nickname: '심심한 레오',
        createdAt: Date.now(),
      }

      mockCreateGuestUseCase.execute.mockResolvedValue(mockGuest)

      const result = await controller.createGuest(battleId)

      expect(result).toEqual(mockGuest)
      expect(mockCreateGuestUseCase.execute).toHaveBeenCalledWith(battleId)
    })

    it('배틀이 존재하지 않으면 NotFoundException을 던진다', async () => {
      mockCreateGuestUseCase.execute.mockRejectedValue(new NotFoundException())

      await expect(controller.createGuest(battleId)).rejects.toThrow(NotFoundException)
    })
  })
})
