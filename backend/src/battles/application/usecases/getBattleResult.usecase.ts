import { Injectable, Inject, BadRequestException } from '@nestjs/common'
import { BATTLE_REPO_PORT, BATTLE_STATE_PORT } from '../ports/tokens'
import type { BattleRepoPort } from '../ports/out/battleRepository.port'
import type { BattleStatePort } from '../ports/out/battleState.port'
import { BATTLE_STATUS, BATTLE_PLAYTIME } from '../../domains/models/const/battles.const'
import { BattleResultResponseDto } from '../../dto/battleResult.dto'
import { BattleResultService } from '../../domains/services/battleResult.service'
import { BattleTimelineService } from '../../domains/services/battleTimeline.service'
import { BattleMvpService } from '../../domains/services/battleMvp.service'

@Injectable()
export class GetBattleResultUseCase {
  constructor(
    @Inject(BATTLE_REPO_PORT) private readonly repo: BattleRepoPort,
    @Inject(BATTLE_STATE_PORT) private readonly stateRepo: BattleStatePort,
    private readonly resultService: BattleResultService,
    private readonly timelineService: BattleTimelineService,
    private readonly mvpService: BattleMvpService,
  ) {}

  async execute(battleId: string): Promise<BattleResultResponseDto> {
    const battle = await this.repo.findUnique(battleId)
    if (battle.status !== BATTLE_STATUS.CLOSED) {
      throw new BadRequestException('배틀이 아직 진행 중입니다.')
    }

    const teamACount = battle.teamACount ?? 0
    const teamBCount = battle.teamBCount ?? 0
    const totalParticipants = battle.totalParticipantsCount ?? teamACount + teamBCount
    const timeline = this.timelineService.toTimeline(battle.timeline as unknown)
    const result = this.resultService.buildBattleResult(teamACount, teamBCount, battle.totalParticipantsCount, battle.winningTeam)

    const dto = new BattleResultResponseDto()
    dto.battleId = battle.id
    dto.authorId = battle.userId
    dto.title = battle.title
    dto.description = battle.description
    dto.status = 'CLOSED'
    dto.language = battle.language
    dto.category = battle.category
    const playTimeKey = battle.playTime as keyof typeof BATTLE_PLAYTIME
    dto.playTime = BATTLE_PLAYTIME[playTimeKey]?.time ?? 0
    dto.topics = battle.topics
    dto.createdAt = battle.createdAt.toISOString()
    dto.finishedAt = battle.finishedAt ? battle.finishedAt.toISOString() : (battle.updatedAt?.toISOString() ?? battle.createdAt.toISOString())
    dto.codeA = battle.codeA
    dto.codeB = battle.codeB
    dto.result = result
    dto.metrics = {
      totalParticipants,
      totalViews: totalParticipants,
      strategiesCount: timeline.length,
      totalChats: 0,
    }
    dto.voteTimeline = [
      {
        turn: 1,
        teamAVotes: teamACount,
        teamBVotes: teamBCount,
        neutralVotes: Math.max(totalParticipants - teamACount - teamBCount, 0),
        timestamp: dto.finishedAt,
      },
    ]
    dto.timeline = timeline
    const mvpsState = this.stateRepo.parseMvpsState(battle.mvpsState as unknown)
    dto.mvps = mvpsState.length > 0 ? mvpsState : this.mvpService.buildLegacyMvpsFromNicknames(battle.mvps ?? [], timeline)

    return dto
  }
}
