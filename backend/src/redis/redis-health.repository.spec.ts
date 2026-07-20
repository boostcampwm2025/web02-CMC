import type { Redis } from 'ioredis'
import { RedisHealthRepository } from './redis-health.repository'

describe('RedisHealthRepository', () => {
  let repository: RedisHealthRepository
  let mockRedis: { status: string; ping: jest.Mock; disconnect: jest.Mock }

  beforeEach(() => {
    mockRedis = {
      status: 'ready',
      ping: jest.fn().mockResolvedValue('PONG'),
      disconnect: jest.fn(),
    }
    repository = new RedisHealthRepository(mockRedis as unknown as Redis)
  })

  it('ready 상태에서는 PING으로 연결을 확인한다', async () => {
    await repository.ping()

    expect(mockRedis.ping).toHaveBeenCalledTimes(1)
  })

  it('ready 상태가 아니면 offline queue에 명령을 넣지 않고 실패한다', async () => {
    mockRedis.status = 'reconnecting'

    await expect(repository.ping()).rejects.toThrow('Redis health client is not ready: reconnecting')
    expect(mockRedis.ping).not.toHaveBeenCalled()
  })

  it('모듈 종료 시 health client 연결을 닫는다', () => {
    repository.onModuleDestroy()

    expect(mockRedis.disconnect).toHaveBeenCalledWith(false)
  })
})
