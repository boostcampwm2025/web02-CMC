import { Injectable, OnModuleInit, OnModuleDestroy, Inject, Logger } from '@nestjs/common'
import { BATTLE_TIMER_PORT } from '../ports/tokens'
import type { BattleTimerPort } from '../ports/out/battleTimer.port'
import { BattlePhaseTransitionUseCase } from './battlePhaseTransition.usecase'

@Injectable()
export class BattleTimerWorkerUseCase implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BattleTimerWorkerUseCase.name)
  private intervalId: NodeJS.Timeout | null = null
  private readonly POLL_INTERVAL_MS = 1000 // 1초

  constructor(
    @Inject(BATTLE_TIMER_PORT) private readonly timer: BattleTimerPort,
    private readonly phaseTransitionUseCase: BattlePhaseTransitionUseCase,
  ) {}

  onModuleInit() {
    this.startPolling()
  }

  onModuleDestroy() {
    this.stopPolling()
  }

  private startPolling(): void {
    this.intervalId = setInterval(() => {
      void this.checkExpiredBattles()
    }, this.POLL_INTERVAL_MS)
  }

  private stopPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private async checkExpiredBattles(): Promise<void> {
    try {
      // 만료된 배틀 조회
      const expiredBattleIds = await this.timer.getExpiredBattles()

      if (expiredBattleIds.length === 0) return
      // 각 배틀의 페이즈 전환 처리
      const results = await Promise.allSettled(expiredBattleIds.map(battleId => this.phaseTransitionUseCase.advancePhase(battleId)))

      // 성공한 배틀만 Redis에서 제거
      const successBattleIds = expiredBattleIds.filter((_, index) => results[index].status === 'fulfilled')

      if (successBattleIds.length > 0) {
        await this.timer.removeExpiredBattles(successBattleIds)
      }
    } catch (error) {
      this.logger.error('Error occurred while polling battles', error)
    }
  }
}
