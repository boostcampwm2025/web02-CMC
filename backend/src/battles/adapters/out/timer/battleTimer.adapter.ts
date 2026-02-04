import { Injectable } from '@nestjs/common'
import { ActiveBattleState } from '../../../domains/models/types/battle.types'
import { BattleTimerPort } from '../../../application/ports/out/battleTimer.port'

@Injectable()
export class BattleTimerAdapter implements BattleTimerPort {
  private battleTimers: Map<string, NodeJS.Timeout> = new Map()

  //배틀 타이머 스케줄러
  schedule(battleId: string, state: ActiveBattleState, updatePhase: (battleId: string) => Promise<void>): void {
    if (!state.expiredAt) return

    const prevTimer = this.battleTimers.get(battleId)
    if (prevTimer) clearTimeout(prevTimer)

    const remaining = Math.max(state.expiredAt - Date.now(), 0)

    const battleTimer = setTimeout(() => {
      void updatePhase(battleId)
    }, remaining)

    this.battleTimers.set(battleId, battleTimer)
  }

  //배틀 타이머 취소
  cancel(battleId: string): void {
    const battleTimer = this.battleTimers.get(battleId)
    if (battleTimer) {
      clearTimeout(battleTimer)
      this.battleTimers.delete(battleId)
    }
  }

  //모든 배틀 타이머 취소 (테스트용)
  clear(): void {
    this.battleTimers.forEach(timer => clearTimeout(timer))
    this.battleTimers.clear()
  }
}
