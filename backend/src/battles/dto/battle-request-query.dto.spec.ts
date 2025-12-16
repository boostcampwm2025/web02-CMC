import { BadRequestException, ValidationPipe, ArgumentMetadata } from '@nestjs/common'
import { BattlesRequestQueryDto } from './battle-request-query.dto'

describe('BattlesRequestQueryDto', () => {
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
  })

  const meta: ArgumentMetadata = {
    type: 'query',
    metatype: BattlesRequestQueryDto,
  }

  it('유효한 값이면 변환되어 통과한다', async () => {
    const value = { limit: '10', offset: '0' }

    const result = (await pipe.transform(value, meta)) as BattlesRequestQueryDto

    expect(result).toEqual({ limit: 10, offset: 0 })
  })

  it('limit이 0이면 BadRequestException', async () => {
    await expect(pipe.transform({ limit: '0', offset: '0' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('offset이 음수이면 BadRequestException', async () => {
    await expect(pipe.transform({ limit: '10', offset: '-1' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('limit이 정수가 아니면 BadRequestException', async () => {
    await expect(pipe.transform({ limit: '1.5', offset: '0' }, meta)).rejects.toThrow(BadRequestException)
  })
})
