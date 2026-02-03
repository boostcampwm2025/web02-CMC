import { Injectable, Inject } from '@nestjs/common'
import { Prisma } from 'generated/prisma/client'
import { BATTLE_STATUS } from '../../domains/models/const/battles.const'
import { ActiveBattleState } from '../../domains/models/types/battle.types'
import type { Mvp } from '../../domains/models/types/battleResult.types'
import { BattleClosedResponseDto } from '../../dto/battleClosedResponse.dto'
import { BATTLE_REPO_PORT, BATTLE_STATE_PORT, BATTLE_BROADCASTER_PORT, BATTLE_TIMER_PORT } from '../ports/tokens'
import type { BattleRepoPort } from '../ports/out/battleRepository.port'
import type { BattleStatePort } from '../ports/out/battleState.port'
import type { BattleBroadcasterPort } from '../ports/out/battleBroadcaster.port'
import type { BattleTimerPort } from '../ports/out/battleTimer.port'
import { BattleResultService } from '../../domains/services/battleResult.service'
import { BattleTimelineService } from '../../domains/services/battleTimeline.service'
import { BattleMvpService } from '../../domains/services/battleMvp.service'
import { BattleTierService } from '../../domains/services/battleTier.service'

@Injectable()
export class BattleTerminationUseCase {
  constructor(
    @Inject(BATTLE_REPO_PORT) private readonly repo: BattleRepoPort,
    @Inject(BATTLE_STATE_PORT) private readonly stateRepo: BattleStatePort,
    @Inject(BATTLE_BROADCASTER_PORT) private readonly broadcaster: BattleBroadcasterPort,
    @Inject(BATTLE_TIMER_PORT) private readonly timer: BattleTimerPort,
    private readonly resultService: BattleResultService,
    private readonly timelineService: BattleTimelineService,
    private readonly mvpService: BattleMvpService,
    private readonly tierService: BattleTierService,
  ) {}

  //배틀 종료
  async finish(state: ActiveBattleState): Promise<void> {
    const battleId = state.battleId
    this.timer.cancel(battleId)

    const finishedAt = new Date()
    const totalParticipants = state.participants.size
    const teamACount = state.teamA.users.length
    const teamBCount = state.teamB.users.length
    const winningTeam = this.resultService.determineWinningTeam(teamACount, teamBCount)
    const timeline = this.timelineService.buildTimeline(state)
    const calculatedMvps = this.mvpService.buildMvps(state, winningTeam)

    await this.repo.update(battleId, {
      status: BATTLE_STATUS.CLOSED,
      finishedAt,
      teamACount,
      teamBCount,
      totalParticipantsCount: totalParticipants,
      winningTeam,
      timeline: timeline as unknown as Prisma.InputJsonValue,
      mvps: calculatedMvps.map(mvp => mvp.nickname),
      mvpsState: calculatedMvps as unknown as Prisma.InputJsonValue,
      updatedAt: finishedAt,
      currentRound: null,
      currentPhase: null,
      phaseCount: null,
      startedAt: null,
      expiredAt: null,
      participantsState: Prisma.DbNull as unknown as Prisma.InputJsonValue,
      teamVotesState: Prisma.DbNull as unknown as Prisma.InputJsonValue,
      userInfoState: Prisma.DbNull as unknown as Prisma.InputJsonValue,
      attacksState: Prisma.DbNull as unknown as Prisma.InputJsonValue,
      defensesState: Prisma.DbNull as unknown as Prisma.InputJsonValue,
      opinionHistoryState: Prisma.DbNull as unknown as Prisma.InputJsonValue,
      chatsAllState: Prisma.DbNull as unknown as Prisma.InputJsonValue,
      chatsTeamAState: Prisma.DbNull as unknown as Prisma.InputJsonValue,
      chatsTeamBState: Prisma.DbNull as unknown as Prisma.InputJsonValue,
    })

    await this.applyRatingChanges(state, winningTeam, calculatedMvps)
    this.broadcaster.emitBattleClosed(BattleClosedResponseDto.of({ battleId }))
  }

  //MVP 선정
  private async applyRatingChanges(state: ActiveBattleState, winningTeam: 'A' | 'B' | 'DRAW', mvps: Mvp[]): Promise<void> {
    const participantIds = [...state.participants.keys()]
    if (participantIds.length === 0) return

    const users = await this.repo.findManyUsers({
      where: { id: { in: participantIds } },
      select: { id: true, rating: true, tier: true },
    })
    if (users.length === 0) return

    const updates = this.tierService.buildRatingUpdates(state.participants, users, winningTeam, mvps, (team, winningTeam) =>
      this.resultService.toBattleResultForTeam(team, winningTeam),
    )

    const topMvps = mvps.slice(0, 3)
    const topMvpUserIds = topMvps.map(mvp => mvp.userId)
    const dbUpdates = [
      this.repo.updateManyBattleParticipants({
        where: { battleId: state.battleId },
        data: { isMvp: false },
      }),
      ...(topMvpUserIds.length > 0
        ? [
            this.repo.updateManyBattleParticipants({
              where: { battleId: state.battleId, userId: { in: topMvpUserIds } },
              data: { isMvp: true },
            }),
          ]
        : []),
      ...updates.map(update =>
        this.repo.updateUser(update.userId, {
          rating: update.nextRating,
          tier: update.nextTier,
        }),
      ),
    ]

    if (dbUpdates.length > 0) {
      await this.repo.transaction(async () => {
        await Promise.all(dbUpdates.map(update => update))
      })
    }
  }
}
