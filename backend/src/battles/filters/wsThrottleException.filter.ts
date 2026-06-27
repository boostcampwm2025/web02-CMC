import type { Socket } from 'socket.io'
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { WsThrottleException, WsThrottleExceptionPayload } from '../exceptions/wsThrottleException'
import { BATTLE_SERVER_EVENTS } from '@cmc/types'

@Catch(WsThrottleException)
export class WsThrottleExceptionFilter implements ExceptionFilter {
  catch(exception: WsThrottleException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>()

    const error = exception.getError() as WsThrottleExceptionPayload

    client.emit(BATTLE_SERVER_EVENTS.THROTTLE_ERROR, error)
  }
}
