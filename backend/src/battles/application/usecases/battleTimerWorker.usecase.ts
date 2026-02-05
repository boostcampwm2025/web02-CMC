import { Injectable, OnModuleInit, OnModuleDestroy, Inject, Logger } from '@nestjs/common'
import { BATTLE_TIMER_PORT } from '../ports/tokens'
import type { BattleTimerPort } from '../ports/out/battleTimer.port'
import { BattlePhaseTransitionUseCase } from './battlePhaseTransition.usecase'

/**
 * 배틀 타이머 폴링 워커
 * 1초마다 Redis Sorted Set에서 만료된 배틀을 조회하고 페이즈 전환 처리
 */
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
    this.logger.log('⏰ 배틀 타이머 폴링 워커 시작 (1초 간격)')
  }

  onModuleDestroy() {
    this.stopPolling()
    this.logger.log('⏹️ 배틀 타이머 폴링 워커 종료')
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
      const now = Date.now()

      // 만료된 배틀 조회
      const expiredBattleIds = await this.timer.getExpiredBattles()

      if (expiredBattleIds.length === 0) return

      console.log(`⏰ [만료 감지] 현재=${now} (${new Date(now).toLocaleString('ko-KR')})`)
      console.log(`   - 발견된 배틀 ${expiredBattleIds.length}개: ${expiredBattleIds.join(', ')}`)

      this.logger.debug(`⏰ 만료된 배틀 ${expiredBattleIds.length}개 발견`)

      // 각 배틀의 페이즈 전환 처리
      const results = await Promise.allSettled(expiredBattleIds.map(battleId => this.phaseTransitionUseCase.advancePhase(battleId)))

      // 성공한 배틀만 Redis에서 제거
      const successBattleIds = expiredBattleIds.filter((_, index) => results[index].status === 'fulfilled')

      if (successBattleIds.length > 0) {
        await this.timer.removeExpiredBattles(successBattleIds)
        this.logger.debug(`✅ ${successBattleIds.length}개 배틀 페이즈 전환 완료`)
      }

      // 실패한 배틀 로깅
      const failedCount = expiredBattleIds.length - successBattleIds.length
      if (failedCount > 0) {
        this.logger.warn(`⚠️ ${failedCount}개 배틀 페이즈 전환 실패 (다음 폴링에서 재시도)`)
      }
    } catch (error) {
      this.logger.error('❌ 배틀 타이머 폴링 중 오류 발생', error)
    }
  }
}
