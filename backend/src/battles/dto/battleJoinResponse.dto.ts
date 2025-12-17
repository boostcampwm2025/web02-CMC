import { BATTLE_TEAM } from '../const/battles.const'
import { ActiveBattleState, BattleChat, BattleDefense, BattleDiscussion } from '../types/battles.types'

export class BattleJoinResponseDto {
  battleId: string
  counts: {
    teamA: number
    teamB: number
  }

  // 배틀 전체 타임라인 & 채팅
  timelines: { attacks: BattleDiscussion[]; defenses: BattleDefense[] }
  allChats: BattleChat[]

  // 해당 진영 이의제기 & 반박 & 채팅
  attacks: BattleDiscussion[]
  defenses: BattleDefense[]
  chats: BattleChat[]

  static fromEntity(payload: ActiveBattleState, team: string): BattleJoinResponseDto {
    const res = new BattleJoinResponseDto()
    const { all, teamA, teamB } = payload
    const myTeam = team === BATTLE_TEAM.A ? teamA : teamB

    res.battleId = payload.battleId
    res.counts = {
      teamA: teamA.users.length,
      teamB: teamB.users.length,
    }
    res.timelines = {
      attacks: all.attacks,
      defenses: all.defenses,
    }

    res.allChats = all.chats
    res.attacks = myTeam.attacks
    res.defenses = myTeam.defenses
    res.chats = myTeam.chats

    return res
  }

  static of(payload: ActiveBattleState, team: string): BattleJoinResponseDto {
    return BattleJoinResponseDto.fromEntity(payload, team)
  }
}
