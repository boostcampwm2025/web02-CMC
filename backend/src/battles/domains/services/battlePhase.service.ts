import { Injectable } from '@nestjs/common'
import { ActiveBattleState, BattlePhase } from '../models/types/battle.types'
import { BATTLE_MAX_PHASE_COUNT, BATTLE_PHASE } from '../models/const/battles.const'

@Injectable()
export class BattlePhaseService {
  // 다음 페이즈 조회
  nextPhase(
    state: ActiveBattleState,
    emitAttackedResult: (state: ActiveBattleState) => void,
    emitDefensedResult: (state: ActiveBattleState) => void,
    resetDiscussions: (state: ActiveBattleState) => void,
    finishBattle: (state: ActiveBattleState) => Promise<void>,
    applyTeamVotes: (state: ActiveBattleState) => void,
  ): BattlePhase | null {
    switch (state.phase) {
      case BATTLE_PHASE.PENDING.name:
        return BATTLE_PHASE.OPINION_SHARE
      case BATTLE_PHASE.OPINION_SHARE.name:
        state.expiredAt = Date.now() + BATTLE_PHASE.ATTACK.time
        return BATTLE_PHASE.ATTACK

      case BATTLE_PHASE.ATTACK.name:
        emitAttackedResult(state)
        resetDiscussions(state)

        return BATTLE_PHASE.DEFENSE

      case BATTLE_PHASE.DEFENSE.name:
        emitDefensedResult(state)
        resetDiscussions(state)

        state.phaseCount++

        if (state.phaseCount <= BATTLE_MAX_PHASE_COUNT) {
          return BATTLE_PHASE.ATTACK
        }

        state.phaseCount = 1

        return BATTLE_PHASE.TEAM_SWITCH

      case BATTLE_PHASE.TEAM_SWITCH.name: {
        applyTeamVotes(state)
        const isNextRound = this.updateRound(state, finishBattle)

        return isNextRound ? BATTLE_PHASE.OPINION_SHARE : null
      }

      default:
        return null
    }
  }

  updateRound(state: ActiveBattleState, finishBattle: (state: ActiveBattleState) => Promise<void>): boolean {
    const nextRound = state.round + 1
    const maxRounds = state.totalRounds

    if (maxRounds < nextRound) {
      void finishBattle(state)
      return false
    }

    state.round = nextRound
    return true
  }
}
