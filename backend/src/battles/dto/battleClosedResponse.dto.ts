import type { BattleClosedResponse } from '@cmc/types'

export class BattleClosedResponseDto implements BattleClosedResponse {
  battleId: string

  static fromEntity(payload: BattleClosedResponseDto): BattleClosedResponseDto {
    const res = new BattleClosedResponseDto()
    const { battleId } = payload

    res.battleId = battleId

    return res
  }

  static of(payload: BattleClosedResponseDto): BattleClosedResponseDto {
    return BattleClosedResponseDto.fromEntity(payload)
  }
}
