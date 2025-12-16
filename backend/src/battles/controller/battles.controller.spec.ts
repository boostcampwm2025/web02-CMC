import { Test, TestingModule } from '@nestjs/testing'
import { BattleController } from './battles.controller'
import { BattleService } from '../service/battles.service'
import { BattleResponseDto } from '../dto/battle-response.dto'
import { BattlesRequestQueryDto } from '../dto/battle-request-query.dto'

describe('BattlesController', () => {
  let controller: BattleController
  let service: jest.Mocked<BattleService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BattleController],
      providers: [
        {
          provide: BattleService,
          useValue: {
            getOpenBattles: jest.fn(),
            getClosedBattles: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get(BattleController)
    service = module.get(BattleService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getOpenBattles', () => {
    it('query.limit/offset을 getOpenBattles로 전달하고 결과를  반환한다', () => {
      const query: BattlesRequestQueryDto = {
        limit: 10,
        offset: 0,
      }

      const mockResult: BattleResponseDto[] = []

      const spy = jest.spyOn(service, 'getOpenBattles').mockReturnValue(mockResult)

      const result = controller.getOpenBattles(query)

      expect(spy).toHaveBeenCalledWith(10, 0)
      expect(result).toBe(mockResult)
    })
  })

  describe('getClosedBattles', () => {
    it('query.limit/offset을 getClosedBattles로 전달하고 결과를 반환한다', () => {
      const query: BattlesRequestQueryDto = {
        limit: 5,
        offset: 20,
      }

      const mockResult: BattleResponseDto[] = []

      const spy = jest.spyOn(service, 'getClosedBattles').mockReturnValue(mockResult)

      const result = controller.getClosedBattles(query)

      expect(spy).toHaveBeenCalledWith(5, 20)
      expect(result).toBe(mockResult)
    })
  })
})
