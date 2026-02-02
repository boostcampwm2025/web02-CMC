import { Injectable } from '@nestjs/common'
import { ActiveBattleState, BattleTeam } from '../types/battles.types'
import { BATTLE_TEAM, BATTLE_PHASE } from '../const/battles.const'

@Injectable()
export class BattleDiscussionPolicy {
  canUserSubmitAttack(battleState: ActiveBattleState, userTeam: BattleTeam): boolean {
    const { phase } = battleState

    if (userTeam === BATTLE_TEAM.NONE) return false

    // OPINION_SHARE 단계에서는 모든 팀이 의견 제출 가능
    if (phase === BATTLE_PHASE.OPINION_SHARE.name || phase === BATTLE_PHASE.ATTACK.name) {
      return true
    }

    return false
  }

  canUserSubmitDefense(battleState: ActiveBattleState, userTeam: BattleTeam): boolean {
    const { phase } = battleState

    if (userTeam === BATTLE_TEAM.NONE) return false

    if (phase === BATTLE_PHASE.DEFENSE.name) {
      return true
    }

    return false
  }

  canUserVoteAttack(battleState: ActiveBattleState): boolean {
    return battleState.phase === BATTLE_PHASE.ATTACK.name
  }

  canUserVoteDefense(battleState: ActiveBattleState): boolean {
    return battleState.phase === BATTLE_PHASE.DEFENSE.name
  }
}
