import { Injectable } from '@nestjs/common'
import { ActiveBattleState, BattleTeam } from '../types/battles.types'
import { BATTLE_TEAM } from '../const/battles.const'

@Injectable()
export class BattleTeamSwitchHandler {
  handleTeamSwitch(
    state: ActiveBattleState,
    emitTeamUpdated: (battleId: string, round: number, beforeCounts: any, afterCounts: any, changes: any[]) => void,
  ): void {
    const changes: Array<{ userId: string; from: BattleTeam; to: BattleTeam }> = []

    // 변경 전 인원 수 저장
    const beforeCounts = {
      teamA: state.teamA.users.length,
      teamB: state.teamB.users.length,
      teamNone: [...state.participants.values()].filter(t => t === BATTLE_TEAM.NONE).length,
    }

    for (const [userId, desiredTeam] of state.teamVotes.entries()) {
      const currentTeam = state.participants.get(userId)
      if (!currentTeam) continue
      if (currentTeam === desiredTeam) continue

      state.participants.set(userId, desiredTeam)
      changes.push({ userId, from: currentTeam, to: desiredTeam })
    }

    state.teamVotes.clear()
    this.rebuildTeamUsers(state)

    //변경 후 인원 수
    const afterCounts = {
      teamA: state.teamA.users.length,
      teamB: state.teamB.users.length,
      teamNone: state.participants.size - (state.teamA.users.length + state.teamB.users.length),
    }

    if (changes.length) {
      emitTeamUpdated(state.battleId, state.round, beforeCounts, afterCounts, changes)
    }
  }

  rebuildTeamUsers(state: ActiveBattleState): void {
    state.teamA.users = []
    state.teamB.users = []

    for (const [userId, team] of state.participants.entries()) {
      if (team === BATTLE_TEAM.A) state.teamA.users.push(userId)
      if (team === BATTLE_TEAM.B) state.teamB.users.push(userId)
    }
  }
}
