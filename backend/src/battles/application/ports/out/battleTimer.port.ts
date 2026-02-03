import { ActiveBattleState } from '../../../domains/models/types/battle.types'

export interface BattleTimerPort {
  //배틀 타이머 스케줄러
  schedule(battleId: string, state: ActiveBattleState, updatePhase: (battleId: string) => Promise<void>): void
  //배틀 타이머 취소
  cancel(battleId: string): void
}
