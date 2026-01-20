import type { BattlePhaseName } from '@cmc/types'

export class BattlePhaseResponseDto {
  battleId: string
  phase: BattlePhaseName
  phaseCount: number

  startedAt: number
  expiredAt: number

  static fromEntity(payload: BattlePhaseResponseDto): BattlePhaseResponseDto {
    const res = new BattlePhaseResponseDto()
    const { battleId, phase, phaseCount, startedAt, expiredAt } = payload

    res.battleId = battleId
    res.phase = phase
    res.phaseCount = phaseCount
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
  topic: string

  static fromEntity(payload: BattleRoundResponseDto): BattleRoundResponseDto {
    const res = new BattleRoundResponseDto()
    const { battleId, round, topic } = payload

    res.battleId = battleId
    res.round = round
    res.topic = topic

    return res
  }

  static of(payload: BattleRoundResponseDto): BattleRoundResponseDto {
    return BattleRoundResponseDto.fromEntity(payload)
  }
}
