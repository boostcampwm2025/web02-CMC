import { BadRequestException, ValidationPipe, ArgumentMetadata } from '@nestjs/common'
import { DiscussionCreateDto, DefenseCreateDto, DiscussionVoteDto } from './discussion.dto'

describe('DiscussionCreateDto', () => {
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
  })

  const meta: ArgumentMetadata = {
    type: 'body',
    metatype: DiscussionCreateDto,
  }

  it('유효한 값이면 통과한다', async () => {
    const value = {
      authorId: 'user-123',
      content: '퀵소트가 더 빠릅니다',
      team: 'A',
    }

    const result = (await pipe.transform(value, meta)) as DiscussionCreateDto

    expect(result).toEqual(value)
  })

  it('authorId가 빈 문자열이면 BadRequestException', async () => {
    await expect(pipe.transform({ authorId: '', content: '내용', team: 'A' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('content가 빈 문자열이면 BadRequestException', async () => {
    await expect(pipe.transform({ authorId: 'user-1', content: '', team: 'A' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('team이 유효하지 않은 값이면 BadRequestException', async () => {
    await expect(pipe.transform({ authorId: 'user-1', content: '내용', team: 'INVALID' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('authorId가 없으면 BadRequestException', async () => {
    await expect(pipe.transform({ content: '내용', team: 'A' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('content가 없으면 BadRequestException', async () => {
    await expect(pipe.transform({ authorId: 'user-1', team: 'A' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('team이 없으면 BadRequestException', async () => {
    await expect(pipe.transform({ authorId: 'user-1', content: '내용' }, meta)).rejects.toThrow(BadRequestException)
  })
})

describe('DefenseCreateDto', () => {
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
  })

  const meta: ArgumentMetadata = {
    type: 'body',
    metatype: DefenseCreateDto,
  }

  it('유효한 값이면 통과한다', async () => {
    const value = {
      authorId: 'user-456',
      attackId: 'attack-1',
      content: '병합 정렬이 안정적입니다',
      team: 'B',
    }

    const result = (await pipe.transform(value, meta)) as DefenseCreateDto

    expect(result).toEqual(value)
  })

  it('attackId가 빈 문자열이면 BadRequestException', async () => {
    await expect(pipe.transform({ authorId: 'user-1', attackId: '', content: '내용', team: 'B' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('attackId가 없으면 BadRequestException', async () => {
    await expect(pipe.transform({ authorId: 'user-1', content: '내용', team: 'B' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('authorId가 없으면 BadRequestException', async () => {
    await expect(pipe.transform({ attackId: 'attack-1', content: '내용', team: 'B' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('content가 없으면 BadRequestException', async () => {
    await expect(pipe.transform({ authorId: 'user-1', attackId: 'attack-1', team: 'B' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('team이 없으면 BadRequestException', async () => {
    await expect(pipe.transform({ authorId: 'user-1', attackId: 'attack-1', content: '내용' }, meta)).rejects.toThrow(BadRequestException)
  })
})

describe('DiscussionVoteDto', () => {
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
  })

  const meta: ArgumentMetadata = {
    type: 'body',
    metatype: DiscussionVoteDto,
  }

  it('유효한 값이면 통과한다', async () => {
    const value = {
      userId: 'user-789',
      team: 'A',
    }

    const result = (await pipe.transform(value, meta)) as DiscussionVoteDto

    expect(result).toEqual(value)
  })

  it('userId가 빈 문자열이면 BadRequestException', async () => {
    await expect(pipe.transform({ userId: '', team: 'A' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('team이 유효하지 않은 값이면 BadRequestException', async () => {
    await expect(pipe.transform({ userId: 'user-1', team: 'INVALID' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('userId가 없으면 BadRequestException', async () => {
    await expect(pipe.transform({ team: 'A' }, meta)).rejects.toThrow(BadRequestException)
  })

  it('team이 없으면 BadRequestException', async () => {
    await expect(pipe.transform({ userId: 'user-1' }, meta)).rejects.toThrow(BadRequestException)
  })
})
