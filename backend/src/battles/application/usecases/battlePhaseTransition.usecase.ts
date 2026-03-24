import { Injectable, Inject } from '@nestjs/common'
import { ActiveBattleState } from '../../domains/models/types/battle.types'
import { BattlePhaseResponseDto, BattleRoundResponseDto } from '../../dto/battleTurnResponse.dto'
import { DiscussionVoteResultDto } from '../../dto/discussionVoteResult.dto'
import { BattleTeamUpdateAllResponseDto } from '../../dto/battleTeamUpdateAllResponse.dto'
import type { TeamCounts, TeamChange } from '../../dto/battleTeamUpdateAllResponse.dto'
import { BATTLE_STATE_PORT, BATTLE_BROADCASTER_PORT, BATTLE_TIMER_PORT } from '../ports/tokens'
import type { BattleStatePort } from '../ports/out/battleState.port'
import type { BattleBroadcasterPort } from '../ports/out/battleBroadcaster.port'
import type { BattleTimerPort } from '../ports/out/battleTimer.port'
import { BattlePhaseService } from '../../domains/services/battlePhase/battlePhase.service'
import { BattleVoteService } from '../../domains/services/battleVote/battleVote.service'
import { BattleDiscussionService } from '../../domains/services/battleDiscussion/battleDiscussion.service'
import { BattleTeamSwitchService } from '../../domains/services/battleTeamSwitch/battleTeamSwitch.service'
import { BattleSkipService } from '../../domains/services/battleSkip/battleSkip.service'
import { BattleTerminationUseCase } from './battleTermination.usecase'

@Injectable()
export class BattlePhaseTransitionUseCase {
  constructor(
    @Inject(BATTLE_STATE_PORT) private readonly stateRepo: BattleStatePort,
    @Inject(BATTLE_BROADCASTER_PORT) private readonly broadcaster: BattleBroadcasterPort,
    @Inject(BATTLE_TIMER_PORT) private readonly timer: BattleTimerPort,
    private readonly phaseService: BattlePhaseService,
    private readonly voteService: BattleVoteService,
    private readonly discussionService: BattleDiscussionService,
    private readonly teamSwitchService: BattleTeamSwitchService,
    private readonly skipService: BattleSkipService,
    private readonly terminationUseCase: BattleTerminationUseCase,
  ) {}

  //phase 전이
  async advancePhase(battleId: string): Promise<void> {
    const { state } = await this.stateRepo.loadBattleState(battleId)

    const prevPhase = state.phase
    const prevRound = state.round
    const now = Date.now()

    let resetType: 'attack' | 'defense' | null = null

    const nextPhase = this.phaseService.nextPhase(
      state,
      state => {
        const top = this.voteService.buildAttackedResult(state, (team, type) => this.discussionService.buildNullPlaceholder(team, type))
        this.broadcaster.emitAttacked(DiscussionVoteResultDto.attacked(state.battleId, top))
      },
      state => {
        const top = this.voteService.buildDefensedResult(state, (team, type) => this.discussionService.buildNullPlaceholder(team, type))
        this.broadcaster.emitDefensed(DiscussionVoteResultDto.defensed(state.battleId, top))
      },
      state => {
        const prevPhase = state.phase
        if (prevPhase === 'ATTACK' || prevPhase === 'OPINION_SHARE') {
          resetType = 'attack'
        } else if (prevPhase === 'DEFENSE') {
          resetType = 'defense'
        }
        this.discussionService.resetDiscussions(state)
      },
      async state => await this.terminationUseCase.finish(state),
      state => {
        this.teamSwitchService.applyTeamSwitch(
          state,
          (battleId: string, round: number, beforeCounts: TeamCounts, afterCounts: TeamCounts, changes: TeamChange[]) => {
            this.broadcaster.emitTeamUpdated(BattleTeamUpdateAllResponseDto.of(battleId, round, beforeCounts, afterCounts, changes))
          },
        )
      },
    )

    if (!nextPhase) return

    state.phase = nextPhase.name
    state.startedAt = now
    state.expiredAt = now + nextPhase.time
    state.skipState = new Set<string>()

    if (prevRound !== state.round) {
      const res = BattleRoundResponseDto.of({
        battleId,
        round: state.round,
        topic: state.topics[state.round - 1],
      })
      this.broadcaster.emitRoundUpdated(res)
    }

    if (prevPhase !== state.phase) {
      const res = BattlePhaseResponseDto.of({
        battleId,
        phase: state.phase,
        phaseCount: state.phaseCount,
        startedAt: state.startedAt,
        expiredAt: state.expiredAt,
      })
      this.broadcaster.emitPhaseUpdated(res)
    }

    this.stateRepo.saveBattleState(battleId, state)

    // Redis 키도 정리
    if (resetType !== null) {
      void this.stateRepo.resetPhaseDiscussionsInRedis(battleId, resetType, ['A', 'B']).catch(() => {})
    }
    void this.scheduleNextTick(battleId)
  }

  //phase 스킵
  async handlePhaseSkip(battleId: string, userId: string, skip: boolean): Promise<number> {
    const { state } = await this.stateRepo.loadBattleState(battleId)

    this.skipService.applyPhaseSkip(state, userId, skip)
    await this.stateRepo.updateSkipState(battleId, state.skipState)

    const skipped = await this.checkAndSkipPhase(battleId, state)
    return skipped ? 0 : state.skipState.size
  }

  //스킵 페이즈
  private async skipPhase(battleId: string): Promise<void> {
    await this.stateRepo.updateSkipState(battleId, new Set<string>())
    await this.advancePhase(battleId)
    this.broadcaster.emitPhaseSkipped(battleId)
  }

  //스킵 페이즈 체크
  async checkAndSkipPhase(battleId: string, state: ActiveBattleState): Promise<boolean> {
    return await this.skipService.shouldSkipPhase(
      state,
      state => this.skipService.buildActiveParticipantsCount(state),
      async battleId => await this.skipPhase(battleId),
    )
  }

  //다음 타이머 스케줄링
  private async scheduleNextTick(battleId: string): Promise<void> {
    try {
      const { state } = await this.stateRepo.loadBattleState(battleId)
      if (!state.expiredAt) return
      // PENDING 상태에서는 타이머 등록하지 않음
      if (state.phase === 'PENDING') return

      this.timer.schedule(battleId, state)
    } catch {
      // ignore if battle not found or closed
    }
  }
}
