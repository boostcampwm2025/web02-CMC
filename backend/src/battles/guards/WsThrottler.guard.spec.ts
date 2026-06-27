import { ExecutionContext, Logger } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { MESSAGE_METADATA } from '@nestjs/websockets/constants'
import { ThrottlerStorage, type ThrottlerRequest } from '@nestjs/throttler'
import { BATTLE_CLIENT_EVENTS } from '@cmc/types'
import { WsThrottlerGuard } from './WsThrottler.guard'
import { WsThrottleException } from '../exceptions/wsThrottleException'
import { RedisThrottlerStorageError } from '../errors/redisThrottlerStorage.error'

describe('WsThrottlerGuard', () => {
  let guard: WsThrottlerGuard
  let storageService: jest.Mocked<ThrottlerStorage>
  let reflector: jest.Mocked<Reflector>
  let loggerErrorSpy: jest.SpyInstance

  let incrementMock: jest.MockedFunction<ThrottlerStorage['increment']>

  beforeEach(() => {
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation()
    incrementMock = jest.fn()

    storageService = {
      increment: incrementMock,
    }
    reflector = {
      get: jest.fn(),
    } as unknown as jest.Mocked<Reflector>

    guard = new WsThrottlerGuard({ throttlers: [] }, storageService, reflector)
  })

  afterEach(() => {
    loggerErrorSpy.mockRestore()
  })

  const createContext = (payload: { battleId?: string } = { battleId: 'battle-1' }): ExecutionContext =>
    ({
      switchToWs: () => ({
        getClient: () => ({
          data: { userId: 'user-1', battleId: 'socket-battle-1' },
          handshake: { auth: { userId: 'auth-user-1' } },
        }),
        getData: () => payload,
      }),
      getHandler: () => () => {},
    }) as unknown as ExecutionContext

  const createRequest = (overrides: Partial<ThrottlerRequest> = {}): ThrottlerRequest => ({
    context: createContext(),
    limit: 5,
    ttl: 1000,
    blockDuration: 1000,
    throttler: { name: BATTLE_CLIENT_EVENTS.CHAT, limit: 5, ttl: 1000 },
    getTracker: jest.fn(),
    generateKey: jest.fn(),
    ...overrides,
  })

  it('현재 WS 이벤트와 throttler name이 다르면 storage를 호출하지 않고 통과한다', async () => {
    reflector.get.mockReturnValue(BATTLE_CLIENT_EVENTS.CHAT)

    const result = await guard.handleRequest(
      createRequest({
        throttler: { name: BATTLE_CLIENT_EVENTS.ATTACK, limit: 1, ttl: 3000 },
      }),
    )

    expect(result).toBe(true)
    expect(incrementMock).not.toHaveBeenCalled()
  })

  it('payload battleId와 userId로 throttle key를 만들고 storage를 호출한다', async () => {
    reflector.get.mockImplementation((metadataKey: unknown) => (metadataKey === MESSAGE_METADATA ? BATTLE_CLIENT_EVENTS.CHAT : undefined))
    storageService.increment.mockResolvedValue({
      totalHits: 1,
      timeToExpire: 1,
      isBlocked: false,
      timeToBlockExpire: 0,
    })

    const result = await guard.handleRequest(createRequest({ context: createContext({ battleId: 'battle-1' }) }))

    expect(result).toBe(true)
    expect(incrementMock).toHaveBeenCalledWith('throttler:battle:chat:battle-1:user-1', 1000, 5, 1000, BATTLE_CLIENT_EVENTS.CHAT)
  })

  it('payload battleId가 없으면 socket data의 battleId를 사용한다', async () => {
    reflector.get.mockReturnValue(BATTLE_CLIENT_EVENTS.CHAT)
    storageService.increment.mockResolvedValue({
      totalHits: 1,
      timeToExpire: 1,
      isBlocked: false,
      timeToBlockExpire: 0,
    })

    await guard.handleRequest(createRequest({ context: createContext({}) }))

    expect(incrementMock).toHaveBeenCalledWith('throttler:battle:chat:socket-battle-1:user-1', 1000, 5, 1000, BATTLE_CLIENT_EVENTS.CHAT)
  })

  it('storage 결과가 blocked이면 WsThrottleException을 던진다', async () => {
    reflector.get.mockReturnValue(BATTLE_CLIENT_EVENTS.CHAT)
    storageService.increment.mockResolvedValue({
      totalHits: 6,
      timeToExpire: 2,
      isBlocked: true,
      timeToBlockExpire: 2,
    })

    await expect(guard.handleRequest(createRequest())).rejects.toThrow(WsThrottleException)
  })

  it('RedisThrottlerStorageError는 throttle용 WS 예외로 변환한다', async () => {
    reflector.get.mockReturnValue(BATTLE_CLIENT_EVENTS.CHAT)
    storageService.increment.mockRejectedValue(new RedisThrottlerStorageError('redis failed', { cause: new Error('boom') }))

    await expect(guard.handleRequest(createRequest())).rejects.toThrow(WsThrottleException)
  })
})
