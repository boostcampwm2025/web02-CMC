import { type Battle as PrismaBattle } from 'generated/prisma/client'
import { ActiveBattleState } from '../../../domains/models/types/battle.types'
import type { Mvp } from '../../../domains/models/types/battleResult.types'

export interface BattleStatePort {
  //배틀 상태 조회
  loadBattleState(battleId: string): Promise<{ battle: PrismaBattle; state: ActiveBattleState }>
  //배틀 상태 저장
  saveBattleState(battleId: string, state: ActiveBattleState): Promise<void>
  //페이즈 스킵 상태 업데이트
  updateSkipState(battleId: string, skipList: Set<string>): Promise<void>
  //MVP 상태 파싱
  parseMvpsState(value: unknown): Mvp[]
}
