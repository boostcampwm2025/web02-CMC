import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { BattlesController } from './battles.controller'
import { BattlesService } from './battles.service'

describe('BattlesController', () => {
  let controller: BattlesController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BattlesController],
      providers: [BattlesService],
    }).compile()

    controller = module.get<BattlesController>(BattlesController)
  })

  it('컨트롤러가 정의되어야 함', () => {
    expect(controller).toBeDefined()
  })

  describe('GET /battles/:id/result', () => {
    it('배틀 결과를 200 상태코드와 함께 반환해야 함', () => {
      const result = controller.getBattleResult('battle-1')
      expect(result).toBeDefined()
      expect(result.battleId).toBe('battle-1')
    })

    it('존재하지 않는 배틀 조회 시 404 에러를 반환해야 함', () => {
      expect(() => controller.getBattleResult('battle-999')).toThrow(NotFoundException)
    })

    it('진행 중인 배틀 조회 시 400 에러를 반환해야 함', () => {
      expect(() => controller.getBattleResult('battle-open-1')).toThrow(BadRequestException)
    })
  })
})
