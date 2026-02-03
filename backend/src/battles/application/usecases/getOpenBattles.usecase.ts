import { Injectable, Inject } from '@nestjs/common'
import { BATTLE_REPO_PORT, BATTLE_UTIL_PORT } from '../ports/tokens'
import type { BattleRepoPort } from '../ports/out/battleRepository.port'
import type { BattleUtilPort } from '../ports/out/battleUtil.port'
import { BATTLE_STATUS } from '../../domains/models/const/battles.const'

@Injectable()
export class GetOpenBattlesUseCase {
  constructor(
    @Inject(BATTLE_REPO_PORT) private readonly repo: BattleRepoPort,
    @Inject(BATTLE_UTIL_PORT) private readonly utilPort: BattleUtilPort,
  ) {}

  async execute(limit: number, offset: number): Promise<{ battles: unknown[]; meta: { offset: number; limit: number; total: number } }> {
    const [records, total] = await Promise.all([
      this.repo.findBattleList({
        onlyPublic: true,
        status: { in: [BATTLE_STATUS.OPEN, BATTLE_STATUS.PENDING] },
        limit,
        offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.repo.countBattleList({
        onlyPublic: true,
        status: { in: [BATTLE_STATUS.OPEN, BATTLE_STATUS.PENDING] },
      }),
    ])

    const battles = this.utilPort.buildOpenBattleList(records)

    return {
      battles,
      meta: { offset, limit, total },
    }
  }
}
