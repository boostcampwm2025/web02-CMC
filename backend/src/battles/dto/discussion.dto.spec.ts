import { BadRequestException, ValidationPipe, ArgumentMetadata } from '@nestjs/common'
import { AttackRequestDto, DefenseRequestDto, AttackVoteRequestDto, DefenseVoteRequestDto } from './discussion.dto'

describe('AttackRequestDto', () => {
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
  })

  const meta: ArgumentMetadata = {
    type: 'body',
    metatype: AttackRequestDto,
  }

  it('유효한 값이면 통과한다', async () => {
    const value = {
      battleId: 'battle-123',
      content: '퀵소트가 더 빠릅니다',
      team: 'A',
    }

    const result = (await pipe.transform(value, meta)) as AttackRequestDto

    expect(result).toEqual(value)
  })

  it('battleId가 빈 문자열이면 BadRequestException', async () => {
    await expect(pipe.transform({ battleId: '', content: '내용', team: 'A' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('content가 빈 문자열이면 BadRequestException', async () => {
    await expect(pipe.transform({ battleId: 'battle-1', content: '', team: 'A' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('team이 유효하지 않은 값이면 BadRequestException', async () => {
    await expect(pipe.transform({ battleId: 'battle-1', content: '내용', team: 'INVALID' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('battleId가 없으면 BadRequestException', async () => {
    await expect(pipe.transform({ content: '내용', team: 'A' }, meta)).rejects.toThrow(BadRequestException)
  })
})

describe('DefenseRequestDto', () => {
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
  })

  const meta: ArgumentMetadata = {
    type: 'body',
    metatype: DefenseRequestDto,
  }

  it('유효한 값이면 통과한다', async () => {
    const value = {
      battleId: 'battle-456',
      content: '병합 정렬이 안정적입니다',
      team: 'B',
    }

    const result = (await pipe.transform(value, meta)) as DefenseRequestDto

    expect(result).toEqual(value)
  })

  it('battleId가 빈 문자열이면 BadRequestException', async () => {
    await expect(pipe.transform({ battleId: '', content: '내용', team: 'B' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('content가 빈 문자열이면 BadRequestException', async () => {
    await expect(pipe.transform({ battleId: 'battle-1', content: '', team: 'B' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('team이 유효하지 않은 값이면 BadRequestException', async () => {
    await expect(pipe.transform({ battleId: 'battle-1', content: '내용', team: 'INVALID' }, meta)).rejects.toThrow(BadRequestException)
  })
})

describe('AttackVoteRequestDto', () => {
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
  })

  const meta: ArgumentMetadata = {
    type: 'body',
    metatype: AttackVoteRequestDto,
  }

  it('유효한 값이면 통과한다', async () => {
    const value = {
      battleId: 'battle-789',
      discussionId: 'attack-1',
      team: 'A',
    }

    const result = (await pipe.transform(value, meta)) as AttackVoteRequestDto

    expect(result).toEqual(value)
  })

  it('battleId가 빈 문자열이면 BadRequestException', async () => {
    await expect(pipe.transform({ battleId: '', discussionId: 'attack-1', team: 'A' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('discussionId가 빈 문자열이면 BadRequestException', async () => {
    await expect(pipe.transform({ battleId: 'battle-1', discussionId: '', team: 'A' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('team이 유효하지 않은 값이면 BadRequestException', async () => {
    await expect(pipe.transform({ battleId: 'battle-1', discussionId: 'attack-1', team: 'INVALID' }, meta)).rejects.toThrow(BadRequestException)
  })
})

describe('DefenseVoteRequestDto', () => {
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
  })

  const meta: ArgumentMetadata = {
    type: 'body',
    metatype: DefenseVoteRequestDto,
  }

  it('유효한 값이면 통과한다', async () => {
    const value = {
      battleId: 'battle-999',
      discussionId: 'defense-1',
      team: 'B',
    }

    const result = (await pipe.transform(value, meta)) as DefenseVoteRequestDto

    expect(result).toEqual(value)
  })

  it('battleId가 빈 문자열이면 BadRequestException', async () => {
    await expect(pipe.transform({ battleId: '', discussionId: 'defense-1', team: 'B' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('discussionId가 빈 문자열이면 BadRequestException', async () => {
    await expect(pipe.transform({ battleId: 'battle-1', discussionId: '', team: 'B' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('team이 유효하지 않은 값이면 BadRequestException', async () => {
    await expect(pipe.transform({ battleId: 'battle-1', discussionId: 'defense-1', team: 'INVALID' }, meta)).rejects.toThrow(BadRequestException)
  })
})
