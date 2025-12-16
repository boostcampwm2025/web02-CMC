import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException } from '@nestjs/common'
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

  it('유효한 요청이면 배틀을 생성하고 battleId를 반환한다', () => {
    const result = controller.createBattle({
      authorId: 'user-1',
      title: '배틀 제목',
      description: '배틀 설명',
      aCode: 'console.log("A")',
      bCode: 'console.log("B")',
      language: 'typescript',
      type: '리팩토링',
      category: '성능',
      playTime: 10,
    })

    expect(result).toEqual(expect.objectContaining({ battleId: expect.any(String) }))
  })

  it('필수 값이 없으면 BadRequestException을 던진다', () => {
    expect(() =>
      controller.createBattle({
        authorId: '',
        title: '',
        description: '',
        aCode: '',
        bCode: '',
        language: '',
        type: '',
        category: '',
        playTime: -1,
      }),
    ).toThrow(BadRequestException)
  })
})
