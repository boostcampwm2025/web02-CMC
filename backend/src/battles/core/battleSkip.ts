import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { ActiveBattleState } from '../types/battles.types'
import { BATTLE_PHASE, BATTLE_TEAM } from '../const/battles.const'

@Injectable()
export class BattleSkipHandler {
  handlePhaseSkip(battleState: ActiveBattleState, userId: string, skip: boolean): void {
    const participant = battleState.participants.get(userId)

    if (battleState.phase === BATTLE_PHASE.TEAM_SWITCH.name) {
      throw new BadRequestException('진영선택 페이즈는 스킵이 불가합니다.')
    }
    if (!participant || participant === BATTLE_TEAM.NONE) {
      throw new UnauthorizedException('권한이 없습니다.')
    }

    if (skip) {
      battleState.skipState.add(userId)
    } else {
      battleState.skipState.delete(userId)
    }
  }

  async checkAndSkipPhase(
    state: ActiveBattleState,
    getActiveParticipantsCount: (state: ActiveBattleState) => number,
    skipPhase: (battleId: string) => Promise<void>,
  ): Promise<boolean> {
    const activeParticipants = getActiveParticipantsCount(state)

    if (activeParticipants > 0 && state.skipState.size === activeParticipants) {
      await skipPhase(state.battleId)
      return true
    }

    return false
  }

  calculateSkipCount(skipped: boolean, skipStateSize: number): number {
    return skipped ? 0 : skipStateSize
  }

  getActiveParticipantsCount(state: ActiveBattleState): number {
    return [...state.participants.values()].filter(team => team !== BATTLE_TEAM.NONE).length
  }
}
