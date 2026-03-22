import { Injectable, Inject, BadRequestException, ForbiddenException, Logger, NotFoundException } from '@nestjs/common'

import { BATTLE_TEAM } from '../../domains/models/const/battles.const'
import { BattleDiscussion, BattleTeam } from '../../domains/models/types/battle.types'
import { DiscussionVoteResponseDto } from '../../dto/discussionVoteResponse.dto'
import type { BattleChatDto } from '../../dto/battleChat.dto'

import { BATTLE_STATE_PORT, BATTLE_REPO_PORT, BATTLE_IDENTIFIER_PORT } from '../ports/tokens'
import type { BattleStatePort } from '../ports/out/battleState.port'
import type { BattleRepoPort } from '../ports/out/battleRepository.port'
import type { BattleIdentifierPort } from '../ports/out/battleIdentifier.port'

import { BattleDiscussionService } from '../../domains/services/battleDiscussion/battleDiscussion.service'
import { BattleChatService } from '../../domains/services/battleChat/battleChat.service'
import { BattleTeamSwitchService } from '../../domains/services/battleTeamSwitch/battleTeamSwitch.service'

@Injectable()
export class BattleInteractionUseCase {
  private readonly logger = new Logger(BattleInteractionUseCase.name)

  constructor(
    @Inject(BATTLE_STATE_PORT) private readonly stateRepo: BattleStatePort,
    @Inject(BATTLE_REPO_PORT) private readonly repo: BattleRepoPort,
    @Inject(BATTLE_IDENTIFIER_PORT) private readonly identifierPort: BattleIdentifierPort,
    private readonly discussionService: BattleDiscussionService,
    private readonly chatService: BattleChatService,
    private readonly teamSwitchService: BattleTeamSwitchService,
  ) {}

  //의견 제출
  async submitDiscussion(
    battleId: string,
    authorId: string,
    content: string,
    team: BattleTeam,
    discussionType: 'attack' | 'defense',
  ): Promise<BattleDiscussion> {
    const discussionId = this.identifierPort.generateId()
    const getNickname = (userId: string) => this.stateRepo.getNicknameByUserId(state, userId) || ''

    const { state } = await this.stateRepo.loadBattleState(battleId)
    let result: BattleDiscussion

    if (discussionType === 'attack') {
      //공격 제출
      result = this.discussionService.applyAttack(state, authorId, content, team, discussionId, getNickname, (state, userTeam) =>
        this.discussionService.canUserSubmitAttack(state, userTeam),
      )
    } else {
      //반론 제출
      result = this.discussionService.applyDefense(state, authorId, content, team, discussionId, getNickname, (state, userTeam) =>
        this.discussionService.canUserSubmitDefense(state, userTeam),
      )
    }

    void this.stateRepo
      .saveDiscussionToRedis(battleId, result, discussionType, team)
      .catch(err => this.logger.error(`[submitDiscussion] Redis write failed: ${(err as Error).message}`))

    return result
  }

  //투표 제출
  async submitVote(
    battleId: string,
    discussionId: string,
    userId: string,
    team: BattleTeam,
    voteType: 'attack' | 'defense',
  ): Promise<DiscussionVoteResponseDto[]> {
    if (team === BATTLE_TEAM.NONE) {
      throw new ForbiddenException('중립 진영은 투표할 수 없습니다.')
    }

    const { state } = await this.stateRepo.loadBattleState(battleId)

    // Phase 검증
    const canVote = voteType === 'attack' ? this.discussionService.canUserVoteAttack(state) : this.discussionService.canUserVoteDefense(state)
    if (!canVote) throw new BadRequestException('현재 투표할 수 없습니다.')

    // Discussion 존재 검증
    const discussions: (BattleDiscussion | null)[] =
      voteType === 'attack'
        ? team === BATTLE_TEAM.A
          ? state.teamA.attacks
          : state.teamB.attacks
        : team === BATTLE_TEAM.A
          ? state.teamA.defenses
          : state.teamB.defenses
    const targetIdx = discussions.findIndex(d => d?.discussionId === discussionId)
    if (targetIdx < 0 || !discussions[targetIdx]) {
      throw new NotFoundException('해당 진영의 이의제기 항목이 없습니다.')
    }

    const { added, prevDiscussionId } = await this.stateRepo.castVoteInRedis(battleId, discussionId, userId)
    if (!added) throw new BadRequestException('이미 투표한 항목입니다.')

    const target = discussions[targetIdx]
    target.votes = [...target.votes.filter(v => v !== userId), userId]
    target.upvotes = target.votes.length

    const updatedDiscussions: DiscussionVoteResponseDto[] = [DiscussionVoteResponseDto.of(battleId, target)]

    if (prevDiscussionId) {
      const prevIdx = discussions.findIndex(d => d?.discussionId === prevDiscussionId)
      if (prevIdx >= 0 && discussions[prevIdx]) {
        const prev = discussions[prevIdx]
        prev.votes = prev.votes.filter(v => v !== userId)
        prev.upvotes = prev.votes.length
        updatedDiscussions.push(DiscussionVoteResponseDto.of(battleId, prev))
      }
    }

    return updatedDiscussions
  }

  //채팅 전송
  async sendChat(
    dto: BattleChatDto,
    userId: string,
  ): Promise<{
    battleId: string
    scope: string
    messageId: string
    team: BattleTeam
    sender: { userId: string; nickname: string; tier?: string }
    text: string
    createdAt: Date
  }> {
    const battleId: string = String(dto.battleId)
    const scope: string = String(dto.scope)
    const team: BattleTeam = dto.team
    const text: string = String(dto.text)
    if (!battleId || !scope) throw new BadRequestException('잘못된 요청입니다.')
    if (!text.trim()) throw new BadRequestException('메시지가 비어 있습니다.')

    const { state } = await this.stateRepo.loadBattleState(battleId)
    const nickname = this.stateRepo.getNicknameByUserId(state, userId) || ''
    const userTier = await this.repo.findUniqueUser(userId, { tier: true })

    const chat = this.chatService.buildChatMessage(this.identifierPort.generateId(), userId, nickname, userTier?.tier ?? undefined, team, text)

    this.chatService.applyChatMessage(state, chat, scope, team)
    this.stateRepo.saveBattleState(battleId, state)
    return { battleId, scope, ...chat }
  }

  //진영 변경 투표
  async switchTeam(battleId: string, userId: string, team: BattleTeam): Promise<void> {
    const { state } = await this.stateRepo.loadBattleState(battleId)
    this.teamSwitchService.applyTeamVote(state, userId, team)
    this.stateRepo.saveBattleState(battleId, state)
  }
}
