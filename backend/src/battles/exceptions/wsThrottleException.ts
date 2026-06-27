import { BATTLE_SERVER_EVENTS } from '@cmc/types'
import { WsException } from '@nestjs/websockets'

export interface WsThrottleExceptionPayload {
  message: string
  code: typeof BATTLE_SERVER_EVENTS.THROTTLE_ERROR
  retryAfter?: number
}

export class WsThrottleException extends WsException {
  constructor(message: string, retryAfter?: number) {
    super({
      message,
      code: BATTLE_SERVER_EVENTS.THROTTLE_ERROR,
      retryAfter,
    } satisfies WsThrottleExceptionPayload)
  }
}
