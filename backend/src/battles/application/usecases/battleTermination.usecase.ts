import { Injectable, Inject, Logger } from '@nestjs/common'
import { Prisma } from 'generated/prisma/client'
import { BATTLE_STATUS } from '../../domains/models/const/battles.const'
import { ActiveBattleState } from '../../domains/models/types/battle.types'
import type { Mvp } from '../../domains/models/types/battleResult.types'
import { BattleClosedResponseDto } from '../../dto/battleClosedResponse.dto'
import { BATTLE_REPO_PORT, BATTLE_STATE_PORT, BATTLE_BROADCASTER_PORT, BATTLE_TIMER_PORT, KAFKA_PUB_PORT } from '../ports/tokens'
import type { BattleRepoPort } from '../ports/out/battleRepository.port'
import type { BattleStatePort } from '../ports/out/battleState.port'
import type { BattleBroadcasterPort } from '../ports/out/battleBroadcaster.port'
import type { BattleTimerPort } from '../ports/out/battleTimer.port'
import type { KafkaPubPort } from '../ports/out/kafkaPublish.port'
import { BattleResultService } from '../../domains/services/battleResult/battleResult.service'
import { BattleTimelineService } from '../../domains/services/battleTimeline/battleTimeline.service'
import { BattleMvpService } from '../../domains/services/battleMvp/battleMvp.service'

@Injectable()
export class BattleTerminationUseCase {
  private readonly logger = new Logger(BattleTerminationUseCase.name)
  constructor(
    @Inject(BATTLE_REPO_PORT) private readonly repo: BattleRepoPort,
    @Inject(BATTLE_STATE_PORT) private readonly stateRepo: BattleStatePort,
    @Inject(BATTLE_BROADCASTER_PORT) private readonly broadcaster: BattleBroadcasterPort,
    @Inject(BATTLE_TIMER_PORT) private readonly timer: BattleTimerPort,
    @Inject(KAFKA_PUB_PORT) private readonly kafkaPubPort: KafkaPubPort,
    private readonly resultService: BattleResultService,
    private readonly timelineService: BattleTimelineService,
    private readonly mvpService: BattleMvpService,
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

    await this.stateRepo.clearBattleStateFromRedis(battleId)

    await this.publishBattleTerminated(state, winningTeam, calculatedMvps)

    this.broadcaster.emitBattleClosed(BattleClosedResponseDto.of({ battleId }))
  }

  //배틀 종료 카프카 이벤트 발행 -> 티어 계산
  private async publishBattleTerminated(state: ActiveBattleState, winningTeam: 'A' | 'B' | 'DRAW', mvps: Mvp[]): Promise<void> {
    try {
      const participants = Array.from(state.participants.entries())
      const mvpIds = mvps.slice(0, 3).map(mvp => mvp.userId)

      await this.kafkaPubPort.publishBattleTerminated({
        type: 'battle.finished',
        battleId: state.battleId,
        participants,
        winningTeam,
        mvpIds,
        finishedAt: new Date().toISOString(),
      })
    } catch (error) {
      this.logger.error(`[Battle Kafka Error] 배틀 종료 이벤트 발행 실패: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
