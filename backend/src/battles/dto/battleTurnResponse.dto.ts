import { BattlePhaseName, BattleTurn } from '../types/battles.types'

export class BattleTurnResponseDto {
  battleId: string
  turn: {
    status: BattleTurn
    count: number
  } | null
  startedAt: number
  expiredAt: number

  static fromEntity(payload: BattleTurnResponseDto): BattleTurnResponseDto {
    const res = new BattleTurnResponseDto()
    const { battleId, turn, startedAt, expiredAt } = payload

    res.battleId = battleId
    res.turn = turn ? { ...turn } : null
    res.startedAt = startedAt
    res.expiredAt = expiredAt

    return res
  }

  static of(payload: BattleTurnResponseDto): BattleTurnResponseDto {
    return BattleTurnResponseDto.fromEntity(payload)
  }
}

export class BattlePhaseResponseDto {
  battleId: string
  phase: BattlePhaseName
  startedAt: number
  expiredAt: number

  static fromEntity(payload: BattlePhaseResponseDto): BattlePhaseResponseDto {
    const res = new BattlePhaseResponseDto()
    const { battleId, phase, startedAt, expiredAt } = payload

    res.battleId = battleId
    res.phase = phase
    res.startedAt = startedAt
    res.expiredAt = expiredAt

    return res
  }

  static of(payload: BattlePhaseResponseDto): BattlePhaseResponseDto {
    return BattlePhaseResponseDto.fromEntity(payload)
  }
}

export class BattleRoundResponseDto {
  battleId: string
  round: number

  static fromEntity(payload: BattleRoundResponseDto): BattleRoundResponseDto {
    const res = new BattleRoundResponseDto()
    const { battleId, round } = payload

    res.battleId = battleId
    res.round = round

    return res
  }

  static of(payload: BattleRoundResponseDto): BattleRoundResponseDto {
    return BattleRoundResponseDto.fromEntity(payload)
  }
}
