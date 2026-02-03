import { Injectable, Inject, BadRequestException } from '@nestjs/common'
import { BATTLE_REPO_PORT, BATTLE_STATE_PORT, BATTLE_UTIL_PORT } from '../ports/tokens'
import type { BattleRepoPort } from '../ports/out/battleRepository.port'
import type { BattleStatePort } from '../ports/out/battleState.port'
import type { BattleUtilPort } from '../ports/out/battleUtil.port'
import { BATTLE_STATUS } from '../../domains/models/const/battles.const'
import { BattleJoinInfoResponseDto } from '../../dto/battleJoinResponse.dto'

@Injectable()
export class GetJoinBattleInfoUseCase {
  constructor(
    @Inject(BATTLE_REPO_PORT) private readonly repo: BattleRepoPort,
    @Inject(BATTLE_STATE_PORT) private readonly stateRepo: BattleStatePort,
    @Inject(BATTLE_UTIL_PORT) private readonly utilPort: BattleUtilPort,
  ) {}

  async execute(battleId: string): Promise<BattleJoinInfoResponseDto> {
    if (!battleId) throw new BadRequestException('Battle ID가 필요합니다.')

    const battle = await this.repo.findUnique(battleId)
    let activeBattleState = undefined
    let participantCount = battle.totalParticipantsCount ?? 0
    if (battle.status !== BATTLE_STATUS.CLOSED) {
      const loaded = await this.stateRepo.loadBattleState(battleId)
      activeBattleState = loaded.state
      participantCount = loaded.state.participants.size
    }

    const mapped = this.utilPort.toBattleEntity(battle, participantCount)
    return BattleJoinInfoResponseDto.of(mapped, activeBattleState)
  }
}
