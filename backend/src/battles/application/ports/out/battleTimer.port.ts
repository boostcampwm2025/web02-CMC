import { ActiveBattleState } from '../../../domains/models/types/battle.types'

export interface BattleTimerPort {
  //배틀 타이머 스케줄러
  schedule(battleId: string, state: ActiveBattleState): void
  //배틀 타이머 취소
  cancel(battleId: string): void
  //만료된 배틀 ID 목록 조회
  getExpiredBattles(): Promise<string[]>
  //만료된 배틀 제거
  removeExpiredBattles(battleIds: string[]): Promise<void>
}
