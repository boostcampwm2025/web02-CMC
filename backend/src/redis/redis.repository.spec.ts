import type { Redis } from 'ioredis'
import { RedisRepository } from './redis.repository'

describe('RedisRepository', () => {
  let repository: RedisRepository
  let mockRedis: Record<string, jest.Mock>

  beforeEach(() => {
    mockRedis = {
      on: jest.fn(),
      quit: jest.fn().mockResolvedValue('OK'),
      get: jest.fn(),
      set: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      hset: jest.fn(),
      hget: jest.fn(),
      hgetall: jest.fn(),
      lpush: jest.fn(),
      lrange: jest.fn(),
    }
    repository = new RedisRepository(mockRedis as unknown as Redis)
  })

  describe('bindEvents', () => {
    it('Redis 이벤트 리스너를 등록한다', () => {
      expect(mockRedis.on).toHaveBeenCalledWith('connect', expect.any(Function))
      expect(mockRedis.on).toHaveBeenCalledWith('ready', expect.any(Function))
      expect(mockRedis.on).toHaveBeenCalledWith('error', expect.any(Function))
      expect(mockRedis.on).toHaveBeenCalledWith('close', expect.any(Function))
    })
  })

  describe('onModuleDestroy', () => {
    it('Redis 연결을 종료한다', async () => {
      await repository.onModuleDestroy()
      expect(mockRedis.quit).toHaveBeenCalled()
    })
  })

  describe('get', () => {
    it('키에 해당하는 값을 반환한다', async () => {
      mockRedis.get.mockResolvedValue('value')
      const result = await repository.get('key')
      expect(result).toBe('value')
      expect(mockRedis.get).toHaveBeenCalledWith('key')
    })

    it('키가 없으면 null을 반환한다', async () => {
      mockRedis.get.mockResolvedValue(null)
      const result = await repository.get('missing')
      expect(result).toBeNull()
    })
  })

  describe('set', () => {
    it('키에 값을 저장한다', async () => {
      mockRedis.set.mockResolvedValue('OK')
      const result = await repository.set('key', 'value')
      expect(result).toBe('OK')
      expect(mockRedis.set).toHaveBeenCalledWith('key', 'value')
    })

    it('TTL을 설정하면 setex를 사용한다', async () => {
      mockRedis.setex.mockResolvedValue('OK')
      const result = await repository.set('key', 'value', 60)
      expect(result).toBe('OK')
      expect(mockRedis.setex).toHaveBeenCalledWith('key', 60, 'value')
    })
  })

  describe('del', () => {
    it('키를 삭제한다', async () => {
      mockRedis.del.mockResolvedValue(1)
      const result = await repository.del('key')
      expect(result).toBe(1)
    })
  })

  describe('exists', () => {
    it('키가 존재하면 true를 반환한다', async () => {
      mockRedis.exists.mockResolvedValue(1)
      const result = await repository.exists('key')
      expect(result).toBe(true)
    })

    it('키가 없으면 false를 반환한다', async () => {
      mockRedis.exists.mockResolvedValue(0)
      const result = await repository.exists('missing')
      expect(result).toBe(false)
    })
  })

  describe('hset', () => {
    it('해시 필드에 값을 저장한다', async () => {
      mockRedis.hset.mockResolvedValue(1)
      const result = await repository.hset('hash', 'field', 'value')
      expect(result).toBe(1)
      expect(mockRedis.hset).toHaveBeenCalledWith('hash', 'field', 'value')
    })
  })

  describe('hget', () => {
    it('해시 필드의 값을 반환한다', async () => {
      mockRedis.hget.mockResolvedValue('value')
      const result = await repository.hget('hash', 'field')
      expect(result).toBe('value')
    })
  })

  describe('hgetall', () => {
    it('해시의 모든 필드를 반환한다', async () => {
      mockRedis.hgetall.mockResolvedValue({ field1: 'a', field2: 'b' })
      const result = await repository.hgetall('hash')
      expect(result).toEqual({ field1: 'a', field2: 'b' })
    })
  })

  describe('lpush', () => {
    it('리스트에 값을 추가한다', async () => {
      mockRedis.lpush.mockResolvedValue(2)
      const result = await repository.lpush('list', 'a', 'b')
      expect(result).toBe(2)
      expect(mockRedis.lpush).toHaveBeenCalledWith('list', 'a', 'b')
    })
  })

  describe('lrange', () => {
    it('리스트의 범위를 반환한다', async () => {
      mockRedis.lrange.mockResolvedValue(['a', 'b'])
      const result = await repository.lrange('list', 0, -1)
      expect(result).toEqual(['a', 'b'])
    })
  })

  describe('getRedisClient', () => {
    it('Redis 클라이언트를 반환한다', () => {
      const client = repository.getRedisClient()
      expect(client).toBe(mockRedis)
    })
  })
})
