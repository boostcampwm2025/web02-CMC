import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { ActiveBattleState } from '../models/types/battle.types'
import { BATTLE_PHASE, BATTLE_TEAM } from '../models/const/battles.const'

@Injectable()
export class BattleSkipService {
  // 페이즈 스킵 적용
  applyPhaseSkip(battleState: ActiveBattleState, userId: string, skip: boolean): void {
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

  // 스킵 카운트 계산
  buildSkipCount(skipped: boolean, skipStateSize: number): number {
    return skipped ? 0 : skipStateSize
  }

  // 활성 참가자 수 계산
  buildActiveParticipantsCount(state: ActiveBattleState): number {
    return [...state.participants.values()].filter(team => team !== BATTLE_TEAM.NONE).length
  }

  // 페이즈 스킵 여부 확인
  async shouldSkipPhase(
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
}
