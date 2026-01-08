import { BATTLE_TEAM } from '../const/battles.const'
import { ActiveBattleState, Battle, BattleChat, BattleDefense, BattleDiscussion, BattlePhaseName, BattleTurn } from '../types/battles.types'

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

  // 현재 진행 중인 배틀 정보
  round: number
  phase: BattlePhaseName
  turn: {
    status: BattleTurn
    count: number
  } | null
  startedAt: number
  expiredAt: number

  static fromEntity(payload: ActiveBattleState, team: string): BattleJoinResponseDto {
    const res = new BattleJoinResponseDto()
    const { all, teamA, teamB, round, phase, turn, startedAt, expiredAt } = payload
    const myTeam = team === BATTLE_TEAM.A ? teamA : team === BATTLE_TEAM.B ? teamB : all

    res.battleId = payload.battleId
    res.counts = {
      teamA: teamA.users.length,
      teamB: teamB.users.length,
    }
    res.timelines = {
      attacks: all.attacks.filter(attack => attack.status === 'SELECTED'),
      defenses: all.defenses.filter(defense => defense.status === 'SELECTED'),
    }

    res.allChats = all.chats
    res.attacks = myTeam.attacks
    res.defenses = myTeam.defenses
    res.chats = myTeam.chats

    res.round = round
    res.phase = phase
    res.turn = turn
    res.startedAt = startedAt
    res.expiredAt = expiredAt

    return res
  }

  static of(payload: ActiveBattleState, team: string): BattleJoinResponseDto {
    return BattleJoinResponseDto.fromEntity(payload, team)
  }
}

export class BattleJoinInfoResponseDto {
  title: string
  description: string
  aCode: string
  bCode: string
  category: string
  language: string
  participantCount: number
  currentRound: number
  totalRounds: number
  timelines: { attacks: BattleDiscussion[]; defenses: BattleDefense[] }

  static fromEntity(battle: Battle, activeBattleState?: ActiveBattleState): BattleJoinInfoResponseDto {
    const res = new BattleJoinInfoResponseDto()
    res.title = battle.title
    res.description = battle.description
    res.aCode = battle.aCode
    res.bCode = battle.bCode
    res.category = battle.category
    res.language = battle.language
    res.participantCount = battle.participantCount

    // ActiveBattleState가 있으면 실시간 데이터 사용, 없으면 초기 상태 사용
    if (activeBattleState) {
      res.currentRound = activeBattleState.round
      res.totalRounds = battle.playTime.rounds
      // 타임라인은 SELECTED 상태인 것만 포함
      res.timelines = {
        attacks: activeBattleState.all.attacks.filter(attack => attack.status === 'SELECTED'),
        defenses: activeBattleState.all.defenses.filter(defense => defense.status === 'SELECTED'),
      }
    } else {
      res.currentRound = battle.initialState.round
      res.totalRounds = battle.playTime.rounds
      res.timelines = { attacks: [], defenses: [] }
    }

    return res
  }

  static of(battle: Battle, activeBattleState?: ActiveBattleState): BattleJoinInfoResponseDto {
    return BattleJoinInfoResponseDto.fromEntity(battle, activeBattleState)
  }
}
