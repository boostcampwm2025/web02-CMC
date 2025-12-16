import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { BattlesController } from './controller/battles.controller'
import { BattlesService } from './service/battles.service'
import { BattleCreateQueryDto } from './dto/battle-create-query.dto'

describe('BattlesController', () => {
  let controller: BattlesController
  let validationPipe: ValidationPipe

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BattlesController],
      providers: [BattlesService],
    }).compile()

    controller = module.get<BattlesController>(BattlesController)
    validationPipe = new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  })

  it('유효한 요청이면 배틀을 생성하고 battleId를 반환한다', async () => {
    const payload = {
      authorId: 'user-1',
      title: '배틀 제목',
      description: '배틀 설명',
      aCode: 'console.log("A")',
      bCode: 'console.log("B")',
      language: 'typescript',
      type: 'PUBLIC',
      category: '성능',
      playTime: 10,
    }

    const transformed = await validationPipe.transform(payload, {
      type: 'body',
      metatype: BattleCreateQueryDto,
    })
    const result = controller.createBattle(transformed as BattleCreateQueryDto)

    expect(result).toEqual(expect.objectContaining({ battleId: expect.any(String) }))
  })

  it('비공개 배틀 생성 시 비밀번호가 있으면 성공한다', async () => {
    const payload = {
      authorId: 'user-1',
      title: '비공개 배틀',
      description: '설명',
      aCode: 'A',
      bCode: 'B',
      language: 'javascript',
      type: 'PRIVATE' as const,
      category: '가독성',
      playTime: 5,
      password: 'pw1234',
    }

    const transformed = await validationPipe.transform(payload, {
      type: 'body',
      metatype: BattleCreateQueryDto,
    })
    const result = controller.createBattle(transformed as BattleCreateQueryDto)

    expect(result).toEqual(expect.objectContaining({ battleId: expect.any(String) }))
  })

  it('필수 값이 없으면 BadRequestException을 던진다', async () => {
    await expect(
      validationPipe.transform(
        {
          authorId: '',
          title: '',
          description: '',
          aCode: '',
          bCode: '',
          language: '',
          type: 'PRIVATE' as const,
          category: '',
          playTime: -1,
        },
        { type: 'body', metatype: BattleCreateQueryDto },
      ),
    ).rejects.toBeInstanceOf(BadRequestException)
  })
})
