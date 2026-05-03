import { Injectable, Inject, BadRequestException } from '@nestjs/common'
import { ActiveBattleState, BattlePhaseName } from '../../domains/models/types/battle.types'
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
import { BATTLE_PHASE, BATTLE_STATUS } from 'src/battles/domains/models/const/battles.const'

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
        if (prevPhase === BATTLE_PHASE.ATTACK.name || prevPhase === BATTLE_PHASE.OPINION_SHARE.name) {
          resetType = 'attack'
        } else {
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
      void this.stateRepo.resetPhaseDiscussionsInRedis(battleId, resetType, ['A', 'B'])
    }
    void this.scheduleNextTick(battleId)
  }

  //phase 스킵
  async handlePhaseSkip(battleId: string, userId: string, skip: boolean): Promise<number> {
    const { state } = await this.stateRepo.loadBattleState(battleId)

    this.skipService.applyPhaseSkip(state, userId, skip)
    await this.stateRepo.updateSkipState(battleId, state.skipState, state.phase)

    const skipped = await this.checkAndSkipPhase(battleId, state)
    return skipped ? 0 : state.skipState.size
  }

  //스킵 페이즈
  private async skipPhase(battleId: string): Promise<void> {
    const { state } = await this.stateRepo.loadBattleState(battleId)
    await this.stateRepo.updateSkipState(battleId, new Set<string>(), state.phase)
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

  //[DEV ONLY] 페이즈 강제 전환 — 정상 전이 로직 우회. liveStates·소켓·타이머 갱신.
  async forcePhase(battleId: string, phase: BattlePhaseName, durationMs?: number, round?: number): Promise<void> {
    const { state } = await this.stateRepo.loadBattleState(battleId)

    if (state.status === BATTLE_STATUS.CLOSED) {
      throw new BadRequestException('종료된 배틀은 페이즈를 변경할 수 없습니다.')
    }

    if (round !== undefined) {
      if (round < 1 || round > state.totalRounds) {
        throw new BadRequestException(`round는 1~${state.totalRounds} 범위여야 합니다.`)
      }
    }

    const now = Date.now()
    const phaseDef = BATTLE_PHASE[phase]
    const time = durationMs ?? phaseDef.time

    const prevRound = state.round
    if (round !== undefined) state.round = round

    state.phase = phase
    state.startedAt = phase === 'PENDING' ? null : now
    state.expiredAt = phase === 'PENDING' || time <= 0 ? null : now + time
    state.skipState = new Set<string>()

    this.stateRepo.saveBattleState(battleId, state)

    if (round !== undefined && prevRound !== state.round) {
      this.broadcaster.emitRoundUpdated(
        BattleRoundResponseDto.of({
          battleId,
          round: state.round,
          topic: state.topics[state.round - 1],
        }),
      )
    }

    this.broadcaster.emitPhaseUpdated(
      BattlePhaseResponseDto.of({
        battleId,
        phase: state.phase,
        phaseCount: state.phaseCount,
        startedAt: state.startedAt ?? 0,
        expiredAt: state.expiredAt ?? 0,
      }),
    )

    if (state.expiredAt) {
      this.timer.schedule(battleId, state)
    } else {
      this.timer.cancel(battleId)
    }
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
