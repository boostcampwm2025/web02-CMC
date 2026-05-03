import { randomUUID } from 'node:crypto'
import { BadRequestException, Body, Controller, ForbiddenException, Get, HttpCode, Inject, OnModuleInit, Param, Post } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BattlePhaseTransitionUseCase } from '../../application/usecases/battlePhaseTransition.usecase'
import { BattleInteractionUseCase } from '../../application/usecases/battleInteraction.usecase'
import { BATTLE_STATE_PORT, BATTLE_BROADCASTER_PORT } from '../../application/ports/tokens'
import type { BattleStatePort } from '../../application/ports/out/battleState.port'
import type { BattleBroadcasterPort } from '../../application/ports/out/battleBroadcaster.port'
import { DevForcePhaseDto, DevForceTimerDto, DevAddParticipantDto, DevInjectDiscussionDto, DevInjectVoteDto } from '../../dto/devForcePhase.dto'
import { BattleUserUpdateResponseDto } from '../../dto/battleUserUpdateResponse.dto'

@Controller('dev/battles')
export class DevController implements OnModuleInit {
  constructor(
    private readonly phaseTransitionUseCase: BattlePhaseTransitionUseCase,
    private readonly interactionUseCase: BattleInteractionUseCase,
    @Inject(BATTLE_STATE_PORT) private readonly stateRepo: BattleStatePort,
    @Inject(BATTLE_BROADCASTER_PORT) private readonly broadcaster: BattleBroadcasterPort,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    this.assertNotProduction()
  }

  @Post(':id/phase')
  @HttpCode(200)
  async forcePhase(
    @Param('id') battleId: string,
    @Body() body: DevForcePhaseDto,
  ): Promise<{ battleId: string; phase: string; durationMs: number | null; round: number | null }> {
    this.assertNotProduction()
    await this.phaseTransitionUseCase.forcePhase(battleId, body.phase, body.durationMs, body.round)
    return { battleId, phase: body.phase, durationMs: body.durationMs ?? null, round: body.round ?? null }
  }

  @Post(':id/timer')
  @HttpCode(200)
  async forceTimer(@Param('id') battleId: string, @Body() body: DevForceTimerDto): Promise<{ battleId: string; durationMs: number }> {
    this.assertNotProduction()
    await this.phaseTransitionUseCase.forceTimer(battleId, body.durationMs)
    return { battleId, durationMs: body.durationMs }
  }

  @Post(':id/participant')
  @HttpCode(200)
  async addParticipant(
    @Param('id') battleId: string,
    @Body() body: DevAddParticipantDto,
  ): Promise<{ battleId: string; userId: string; team: string; nickname: string; counts: { teamA: number; teamB: number; teamNone: number } }> {
    this.assertNotProduction()

    const { state } = await this.stateRepo.loadBattleState(battleId)

    const userId = body.userId ?? randomUUID()
    if (state.participants.has(userId)) {
      throw new BadRequestException(`userId=${userId}는 이미 배틀에 참가 중입니다.`)
    }

    const teamUsers = body.team === 'A' ? state.teamA.users : state.teamB.users
    const nickname = body.nickname ?? `테스터-${body.team}${teamUsers.length + 1}`

    state.participants.set(userId, body.team)
    state.userInfoMap.set(userId, nickname)
    state.teamVotes.set(userId, body.team)
    teamUsers.push(userId)

    this.stateRepo.saveBattleState(battleId, state)

    const counts = {
      teamA: state.teamA.users.length,
      teamB: state.teamB.users.length,
      teamNone: state.participants.size - state.teamA.users.length - state.teamB.users.length,
    }

    this.broadcaster.emitUserUpdated(BattleUserUpdateResponseDto.of(battleId, counts))

    return { battleId, userId, team: body.team, nickname, counts }
  }

  @Post(':id/discussion')
  @HttpCode(200)
  async injectDiscussion(
    @Param('id') battleId: string,
    @Body() body: DevInjectDiscussionDto,
  ): Promise<{ battleId: string; discussionId: string; type: string; team: string; authorId: string; nickname: string }> {
    this.assertNotProduction()

    const { state } = await this.stateRepo.loadBattleState(battleId)

    const expectedPhase = body.type === 'attack' ? 'ATTACK' : 'DEFENSE'
    if (state.phase !== expectedPhase) {
      throw new BadRequestException(`현재 페이즈가 ${state.phase}입니다. ${body.type} 주입은 ${expectedPhase} 페이즈에서만 가능합니다.`)
    }

    const teamUsers = body.team === 'A' ? state.teamA.users : state.teamB.users
    const authorId = body.authorId ?? teamUsers[0]
    if (!authorId) {
      throw new BadRequestException(`team ${body.team}에 참가자가 없습니다. authorId를 명시하거나 먼저 참가자를 추가하세요.`)
    }

    const discussion = await this.interactionUseCase.submitDiscussion(battleId, authorId, body.content, body.team, body.type)

    if (body.type === 'attack') {
      this.broadcaster.emitAttackCreated(battleId, body.team, discussion)
    } else {
      this.broadcaster.emitDefenseCreated(battleId, body.team, discussion)
    }

    return {
      battleId,
      discussionId: discussion.discussionId,
      type: body.type,
      team: body.team,
      authorId,
      nickname: discussion.author.nickname,
    }
  }

  @Post(':id/vote')
  @HttpCode(200)
  async injectVote(
    @Param('id') battleId: string,
    @Body() body: DevInjectVoteDto,
  ): Promise<{ battleId: string; discussionId: string; type: string; team: string; voterId: string; updatedCount: number }> {
    this.assertNotProduction()

    const { state } = await this.stateRepo.loadBattleState(battleId)

    const voterId = body.voterId ?? Array.from(state.participants.keys())[0]
    if (!voterId) {
      throw new BadRequestException('배틀에 참가자가 없습니다. voterId를 명시하거나 먼저 참가자를 추가하세요.')
    }

    const updates = await this.interactionUseCase.submitVote(battleId, body.discussionId, voterId, body.team, body.type)

    updates.forEach(update => {
      if (body.type === 'attack') {
        this.broadcaster.emitAttackVoted(battleId, body.team, update)
      } else {
        this.broadcaster.emitDefenseVoted(battleId, body.team, update)
      }
    })

    return {
      battleId,
      discussionId: body.discussionId,
      type: body.type,
      team: body.team,
      voterId,
      updatedCount: updates.length,
    }
  }

  @Get(':id/inspect')
  async inspect(@Param('id') battleId: string) {
    this.assertNotProduction()

    const { state } = await this.stateRepo.loadBattleState(battleId)
    const now = Date.now()

    const teamAUsers = state.teamA.users.map(userId => ({
      userId,
      nickname: state.userInfoMap.get(userId) ?? null,
    }))
    const teamBUsers = state.teamB.users.map(userId => ({
      userId,
      nickname: state.userInfoMap.get(userId) ?? null,
    }))
    const noneUsers = Array.from(state.participants.entries())
      .filter(([, team]) => team === 'NONE')
      .map(([userId]) => ({ userId, nickname: state.userInfoMap.get(userId) ?? null }))

    const teamVoteCounts = { A: 0, B: 0, NONE: 0 }
    state.teamVotes.forEach(team => {
      teamVoteCounts[team] = (teamVoteCounts[team] ?? 0) + 1
    })

    const countDiscussions = (arr: unknown[]) => arr.filter(d => d !== null).length

    return {
      battleId,
      now,
      meta: {
        status: state.status,
        phase: state.phase,
        phaseCount: state.phaseCount,
        round: state.round,
        totalRounds: state.totalRounds,
        currentTopic: state.topics[state.round - 1] ?? null,
        topics: state.topics,
      },
      timer: {
        startedAt: state.startedAt,
        expiredAt: state.expiredAt,
        remainingMs: state.expiredAt ? state.expiredAt - now : null,
      },
      participants: {
        total: state.participants.size,
        teamA: { count: teamAUsers.length, users: teamAUsers },
        teamB: { count: teamBUsers.length, users: teamBUsers },
        teamNone: { count: noneUsers.length, users: noneUsers },
      },
      teamVotes: {
        A: teamVoteCounts.A,
        B: teamVoteCounts.B,
        NONE: teamVoteCounts.NONE,
        totalVoted: state.teamVotes.size,
      },
      discussions: {
        all: { attacks: countDiscussions(state.all.attacks), defenses: countDiscussions(state.all.defenses) },
        teamA: { attacks: countDiscussions(state.teamA.attacks), defenses: countDiscussions(state.teamA.defenses) },
        teamB: { attacks: countDiscussions(state.teamB.attacks), defenses: countDiscussions(state.teamB.defenses) },
        opinionHistory: state.opinionHistory.length,
      },
      chats: {
        all: state.all.chats.length,
        teamA: state.teamA.chats.length,
        teamB: state.teamB.chats.length,
      },
      skipState: {
        count: state.skipState.size,
        userIds: Array.from(state.skipState),
      },
    }
  }

  private assertNotProduction(): void {
    if (this.config.get<string>('NODE_ENV') === 'production') {
      throw new ForbiddenException('dev 엔드포인트는 production 환경에서 사용할 수 없습니다.')
    }
  }
}
