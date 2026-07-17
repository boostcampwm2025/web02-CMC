/* eslint-disable @typescript-eslint/unbound-method */
import { Logger } from '@nestjs/common'
import { BattleTimerWorkerUseCase } from './battleTimerWorker.usecase'
import type { BattleTimerPort } from '../ports/out/battleTimer.port'
import type { BattlePhaseTransitionUseCase } from './battlePhaseTransition.usecase'

describe('BattleTimerWorkerUseCase', () => {
  let timer: jest.Mocked<BattleTimerPort>
  let phaseTransitionUseCase: jest.Mocked<BattlePhaseTransitionUseCase>
  let worker: BattleTimerWorkerUseCase
  let loggerErrorSpy: jest.SpyInstance

  beforeEach(() => {
    jest.useFakeTimers()
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation()
    timer = {
      getExpiredBattles: jest.fn().mockResolvedValue([]),
      removeExpiredBattles: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<BattleTimerPort>
    phaseTransitionUseCase = {
      advancePhase: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<BattlePhaseTransitionUseCase>
    worker = new BattleTimerWorkerUseCase(timer, phaseTransitionUseCase)
  })

  afterEach(() => {
    worker.onModuleDestroy()
    loggerErrorSpy.mockRestore()
    jest.useRealTimers()
  })

  it('이전 폴링이 끝나기 전에는 다음 폴링을 시작하지 않는다', async () => {
    let resolvePolling: ((battleIds: string[]) => void) | undefined
    timer.getExpiredBattles.mockImplementation(
      () =>
        new Promise(resolve => {
          resolvePolling = resolve
        }),
    )

    worker.onModuleInit()
    jest.advanceTimersByTime(3000)

    expect(timer.getExpiredBattles).toHaveBeenCalledTimes(1)

    resolvePolling?.([])
    await Promise.resolve()
    await Promise.resolve()
    jest.advanceTimersByTime(1000)

    expect(timer.getExpiredBattles).toHaveBeenCalledTimes(2)
  })

  it('폴링 실패 후 다음 주기에 다시 시도한다', async () => {
    timer.getExpiredBattles.mockRejectedValueOnce(new Error('redis unavailable')).mockResolvedValueOnce([])

    worker.onModuleInit()
    jest.advanceTimersByTime(1000)
    await Promise.resolve()
    await Promise.resolve()
    jest.advanceTimersByTime(1000)

    expect(timer.getExpiredBattles).toHaveBeenCalledTimes(2)
    expect(loggerErrorSpy).toHaveBeenCalledWith('Error occurred while polling battles', expect.any(Error))
  })
})
