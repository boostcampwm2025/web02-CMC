import { ArgumentsHost } from '@nestjs/common'
import { BATTLE_SERVER_EVENTS } from '@cmc/types'
import { WsThrottleException } from '../exceptions/wsThrottleException'
import { WsThrottleExceptionFilter } from './wsThrottleException.filter'

describe('WsThrottleExceptionFilter', () => {
  let filter: WsThrottleExceptionFilter
  let client: { emit: jest.Mock }
  let host: ArgumentsHost

  beforeEach(() => {
    filter = new WsThrottleExceptionFilter()
    client = {
      emit: jest.fn(),
    }
    host = {
      switchToWs: jest.fn().mockReturnValue({
        getClient: jest.fn().mockReturnValue(client),
      }),
    } as unknown as ArgumentsHost
  })

  it('WsThrottleException을 THROTTLE_ERROR 이벤트로 emit한다', () => {
    const exception = new WsThrottleException('2초 후에 다시 시도해주세요.', 2)

    filter.catch(exception, host)

    expect(client.emit).toHaveBeenCalledWith(BATTLE_SERVER_EVENTS.THROTTLE_ERROR, {
      message: '2초 후에 다시 시도해주세요.',
      code: BATTLE_SERVER_EVENTS.THROTTLE_ERROR,
      retryAfter: 2,
    })
  })

  it('retryAfter가 없어도 payload를 emit한다', () => {
    const exception = new WsThrottleException('서버에 오류가 발생하였습니다.')

    filter.catch(exception, host)

    expect(client.emit).toHaveBeenCalledWith(BATTLE_SERVER_EVENTS.THROTTLE_ERROR, {
      message: '서버에 오류가 발생하였습니다.',
      code: BATTLE_SERVER_EVENTS.THROTTLE_ERROR,
      retryAfter: undefined,
    })
  })
})
