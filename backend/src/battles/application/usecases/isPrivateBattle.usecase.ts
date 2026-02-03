import { Injectable, Inject } from '@nestjs/common'
import { BATTLE_REPO_PORT } from '../ports/tokens'
import type { BattleRepoPort } from '../ports/out/battleRepository.port'

@Injectable()
export class IsPrivateBattleUseCase {
  constructor(@Inject(BATTLE_REPO_PORT) private readonly repo: BattleRepoPort) {}

  async execute(battleId: string): Promise<boolean> {
    const battle = await this.repo.findUnique(battleId)
    return battle.isPrivate
  }
}
