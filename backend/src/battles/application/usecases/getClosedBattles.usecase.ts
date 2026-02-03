import { Injectable, Inject } from '@nestjs/common'
import { BATTLE_REPO_PORT, BATTLE_UTIL_PORT } from '../ports/tokens'
import type { BattleRepoPort } from '../ports/out/battleRepository.port'
import type { BattleUtilPort } from '../ports/out/battleUtil.port'
import { BATTLE_STATUS } from '../../domains/models/const/battles.const'
import { BattleResultService } from '../../domains/services/battleResult.service'

@Injectable()
export class GetClosedBattlesUseCase {
  constructor(
    @Inject(BATTLE_REPO_PORT) private readonly repo: BattleRepoPort,
    @Inject(BATTLE_UTIL_PORT) private readonly utilPort: BattleUtilPort,
    private readonly resultService: BattleResultService,
  ) {}

  async execute(limit: number, offset: number): Promise<{ battles: unknown[]; meta: { offset: number; limit: number; total: number } }> {
    const [records, total] = await Promise.all([
      this.repo.findBattleList({
        status: BATTLE_STATUS.CLOSED,
        limit,
        offset,
        orderBy: { finishedAt: 'desc' },
      }),
      this.repo.countBattleList({
        status: BATTLE_STATUS.CLOSED,
      }),
    ])

    const battles = this.utilPort.buildClosedBattleList(records, this.resultService)

    return {
      battles,
      meta: { offset, limit, total },
    }
  }
}
