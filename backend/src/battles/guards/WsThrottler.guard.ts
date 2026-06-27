import { ExecutionContext, Injectable, Logger } from '@nestjs/common'
import {
  InjectThrottlerOptions,
  InjectThrottlerStorage,
  ThrottlerGuard,
  ThrottlerStorage,
  type ThrottlerModuleOptions,
  type ThrottlerRequest,
} from '@nestjs/throttler'
import { Reflector } from '@nestjs/core'
import type { SocketWithUserId } from '../domains/models/types/socket.types'
import { MESSAGE_METADATA } from '@nestjs/websockets/constants'
import { RedisThrottlerStorageError } from '../errors/redisThrottlerStorage.error'
import { WsThrottleException } from '../exceptions/wsThrottleException'

@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(WsThrottlerGuard.name)

  constructor(
    @InjectThrottlerOptions()
    protected readonly options: ThrottlerModuleOptions,
    @InjectThrottlerStorage()
    protected readonly storageService: ThrottlerStorage,
    protected readonly reflector: Reflector,
  ) {
    super(options, storageService, reflector)
  }

  async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const { context, ttl, limit, blockDuration, throttler } = requestProps

    const eventName = this.getEventName(context)
    if (throttler.name !== eventName) return true

    const tracker = this.getBattleTracker(context)
    const key = this.generateKey(context, tracker)

    const result = await this.storageService.increment(key, ttl, limit, blockDuration, throttler.name ?? 'battle').catch(error => {
      if (error instanceof RedisThrottlerStorageError) {
        this.logger.error('Redis Throttler 스토리지 오류 발생', error.stack)
        throw new WsThrottleException('서버에 오류가 발생하였습니다. 잠시 후에 다시 시도해주세요.')
      }

      throw error
    })

    if (result.isBlocked) {
      throw new WsThrottleException(`${result.timeToBlockExpire}초 후에 다시 시도해주세요.`, result.timeToBlockExpire)
    }

    return true
  }

  private getBattleTracker(context: ExecutionContext): string {
    const client = this.getClient(context)

    const userId = client.data.userId ?? client.handshake.auth.userId ?? 'anonymous'
    const payload = context.switchToWs().getData<{ battleId?: string }>()
    const battleId = payload?.battleId ?? client.data.battleId ?? 'unknown'

    return `${battleId}:${userId}`
  }

  protected generateKey(context: ExecutionContext, tracker: string): string {
    // battle:chat, battle:attack, battle:defense
    const event = this.getEventName(context)

    if (!event) {
      throw new WsThrottleException('확인할 수 없는 이벤트명입니다.')
    }

    // throttler:battle:chat:019ef8d0-5161-7408-adc5-fa9c637f866f:019f0283-b681-7301-b17a-92122e690e55
    return `throttler:${event}:${tracker}`
  }

  private getClient(context: ExecutionContext): SocketWithUserId {
    return context.switchToWs().getClient<SocketWithUserId>()
  }

  private getEventName(context: ExecutionContext): string | undefined {
    return this.reflector.get<string | undefined>(MESSAGE_METADATA, context.getHandler())
  }
}
