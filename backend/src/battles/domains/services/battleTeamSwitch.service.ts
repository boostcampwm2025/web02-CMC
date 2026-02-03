import { Injectable, BadRequestException } from '@nestjs/common'
import { ActiveBattleState, BattleTeam } from '../models/types/battle.types'
import { BATTLE_TEAM, BATTLE_PHASE } from '../models/const/battles.const'
import type { TeamCounts, TeamChange } from '../../dto/battleTeamUpdateAllResponse.dto'

@Injectable()
export class BattleTeamSwitchService {
  // 팀 변경 적용
  applyTeamSwitch(
    state: ActiveBattleState,
    emitTeamUpdated: (battleId: string, round: number, beforeCounts: TeamCounts, afterCounts: TeamCounts, changes: TeamChange[]) => void,
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

  // 팀 변경 투표 적용
  applyTeamVote(state: ActiveBattleState, userId: string, team: BattleTeam): void {
    if (state.phase !== BATTLE_PHASE.TEAM_SWITCH.name) {
      throw new BadRequestException('팀 변경 투표는 TEAM_SWITCH 페이즈에서만 가능합니다.')
    }

    if (!state.participants.has(userId)) {
      throw new BadRequestException('배틀 참가자만 팀 변경 투표를 할 수 있습니다.')
    }

    state.teamVotes.set(userId, team)
  }

  // 참가자 추가
  applyParticipant(
    state: ActiveBattleState,
    userId: string,
    team: BattleTeam,
    emitUserUpdated: (battleId: string, counts: { teamA: number; teamB: number; teamNone: number }) => void,
  ): void {
    state.participants.set(userId, team)
    this.rebuildTeamUsers(state)

    const counts = {
      teamA: state.teamA.users.length,
      teamB: state.teamB.users.length,
      teamNone: state.participants.size - (state.teamA.users.length + state.teamB.users.length),
    }

    emitUserUpdated(state.battleId, counts)
  }

  // 팀 사용자 재구성
  rebuildTeamUsers(state: ActiveBattleState): void {
    state.teamA.users = []
    state.teamB.users = []

    for (const [userId, team] of state.participants.entries()) {
      if (team === BATTLE_TEAM.A) state.teamA.users.push(userId)
      if (team === BATTLE_TEAM.B) state.teamB.users.push(userId)
    }
  }
}
