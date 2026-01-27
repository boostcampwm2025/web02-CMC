import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { BattlesController } from './battles.controller'
import { BattlesService } from '../service/battles.service'
import { BattleListRequestQueryDto } from '../dto/battleListRequestQuery.dto'
import { BattleResultResponseDto } from '../dto/battleResult.dto'

describe('BattlesController', () => {
  let controller: BattlesController
  let service: jest.Mocked<BattlesService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BattlesController],
      providers: [
        {
          provide: BattlesService,
          useValue: {
            getOpenBattles: jest.fn(),
            getClosedBattles: jest.fn(),
            getBattleResult: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get(BattlesController)
    service = module.get(BattlesService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getOpenBattles', () => {
    it('query.limit/offset을 getOpenBattles로 전달하고 결과를  반환한다', async () => {
      const query: BattleListRequestQueryDto = {
        limit: 10,
        offset: 0,
      }

      const mockResult = {
        battles: [],
        meta: {
          limit: 10,
          offset: 0,
          total: 0,
        },
      }

      const spy = jest.spyOn(service, 'getOpenBattles').mockResolvedValue(mockResult as never)

      const result = await controller.getOpenBattles(query)

      expect(spy).toHaveBeenCalledWith(10, 0)
      expect(result).toBe(mockResult)
    })
  })

  describe('getClosedBattles', () => {
    it('query.limit/offset을 getClosedBattles로 전달하고 결과를 반환한다', async () => {
      const query: BattleListRequestQueryDto = {
        limit: 5,
        offset: 20,
      }

      const mockResult = {
        battles: [],
        meta: {
          limit: 5,
          offset: 20,
          total: 0,
        },
      }

      const spy = jest.spyOn(service, 'getClosedBattles').mockResolvedValue(mockResult as never)

      const result = await controller.getClosedBattles(query)

      expect(spy).toHaveBeenCalledWith(5, 20)
      expect(result).toBe(mockResult)
    })
  })

  describe('GET /battles/:id/result', () => {
    it('배틀 결과를 200 상태코드와 함께 반환해야 함', async () => {
      const mockResult = {
        battleId: 'battle-1',
        status: 'CLOSED' as const,
      }

      jest.spyOn(service, 'getBattleResult').mockResolvedValue(mockResult as BattleResultResponseDto)

      const result = await controller.getBattleResult('battle-1')
      expect(result).toBeDefined()
      expect(result.battleId).toBe('battle-1')
    })

    it('존재하지 않는 배틀 조회 시 404 에러를 반환해야 함', async () => {
      jest.spyOn(service, 'getBattleResult').mockRejectedValue(new NotFoundException() as never)

      await expect(controller.getBattleResult('battle-999')).rejects.toThrow(NotFoundException)
    })

    it('진행 중인 배틀 조회 시 400 에러를 반환해야 함', async () => {
      jest.spyOn(service, 'getBattleResult').mockRejectedValue(new BadRequestException() as never)

      await expect(controller.getBattleResult('battle-open-1')).rejects.toThrow(BadRequestException)
    })
  })
})
