import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common'
import { BATTLE_REPO_PORT } from '../ports/tokens'
import type { BattleRepoPort } from '../ports/out/battleRepository.port'
import { BATTLE_STATUS } from '../../domains/models/const/battles.const'

@Injectable()
export class GetBattleByInviteCodeUseCase {
  constructor(@Inject(BATTLE_REPO_PORT) private readonly repo: BattleRepoPort) {}

  async execute(inviteCode: string): Promise<{ battleId: string }> {
    if (!inviteCode) throw new BadRequestException('초대 코드가 필요합니다.')

    const battle = await this.repo.findUniqueByInviteCode(inviteCode)

    if (!battle) {
      throw new NotFoundException('잘못된 초대 코드입니다.')
    }

    if (battle.status === BATTLE_STATUS.CLOSED) {
      throw new BadRequestException('이미 종료된 배틀입니다.')
    }

    return { battleId: battle.id }
  }
}
