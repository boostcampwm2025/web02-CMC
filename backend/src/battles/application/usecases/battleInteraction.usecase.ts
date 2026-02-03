import { Injectable, Inject, BadRequestException, ForbiddenException } from '@nestjs/common'

import { BATTLE_TEAM } from '../../domains/models/const/battles.const'
import { BattleDiscussion, BattleTeam, ActiveBattleState } from '../../domains/models/types/battle.types'
import { DiscussionVoteResponseDto } from '../../dto/discussionVoteResponse.dto'
import type { BattleChatDto } from '../../dto/battleChat.dto'

import { BATTLE_STATE_PORT, BATTLE_REPO_PORT, BATTLE_UTIL_PORT } from '../ports/tokens'
import type { BattleStatePort } from '../ports/out/battleState.port'
import type { BattleRepoPort } from '../ports/out/battleRepository.port'
import type { BattleUtilPort } from '../ports/out/battleUtil.port'

import { BattleVoteService } from '../../domains/services/battleVote.service'
import { BattleDiscussionService } from '../../domains/services/battleDiscussion.service'
import { BattleChatService } from '../../domains/services/battleChat.service'
import { BattleTeamSwitchService } from '../../domains/services/battleTeamSwitch.service'

@Injectable()
export class BattleInteractionUseCase {
  constructor(
    @Inject(BATTLE_STATE_PORT) private readonly stateRepo: BattleStatePort,
    @Inject(BATTLE_REPO_PORT) private readonly repo: BattleRepoPort,
    @Inject(BATTLE_UTIL_PORT) private readonly utilPort: BattleUtilPort,
    private readonly voteService: BattleVoteService,
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
    const battleStateResult = await this.stateRepo.loadBattleState(battleId)
    const state: ActiveBattleState = battleStateResult.state
    const discussionId = this.utilPort.generateId()
    const getNickname = (userId: string) => this.stateRepo.getNicknameByUserId(state, userId) || ''

    if (discussionType === 'attack') {
      //공격 제출
      const attack = this.discussionService.applyAttack(state, authorId, content, team, discussionId, getNickname, (state, userTeam) =>
        this.discussionService.canUserSubmitAttack(state, userTeam),
      )
      await this.stateRepo.saveBattleState(battleId, state)
      return attack
    } else {
      //반론 제출
      const defense = this.discussionService.applyDefense(state, authorId, content, team, discussionId, getNickname, (state, userTeam) =>
        this.discussionService.canUserSubmitDefense(state, userTeam),
      )
      await this.stateRepo.saveBattleState(battleId, state)
      return defense
    }
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

    const battleStateResult = await this.stateRepo.loadBattleState(battleId)
    const state: ActiveBattleState = battleStateResult.state

    const updatedDiscussions =
      voteType === 'attack'
        ? this.voteService.applyAttackVote(state, discussionId, userId, team, state => this.discussionService.canUserVoteAttack(state))
        : this.voteService.applyDefenseVote(state, discussionId, userId, team, state => this.discussionService.canUserVoteDefense(state))

    await this.stateRepo.saveBattleState(battleId, state)
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
    const team: BattleTeam = dto.team as BattleTeam
    const text: string = String(dto.text)
    if (!battleId || !scope) throw new BadRequestException('잘못된 요청입니다.')
    if (!text.trim()) throw new BadRequestException('메시지가 비어 있습니다.')

    const battleStateResult = await this.stateRepo.loadBattleState(battleId)
    const state: ActiveBattleState = battleStateResult.state
    const nickname = this.stateRepo.getNicknameByUserId(state, userId) || ''
    const userTier = await this.repo.findUniqueUser(userId, { tier: true })

    const chat = this.chatService.buildChatMessage(this.utilPort.generateId(), userId, nickname, userTier?.tier ?? undefined, team, text)

    this.chatService.applyChatMessage(state, chat, scope, team)
    await this.stateRepo.saveBattleState(battleId, state)
    return { battleId, scope, ...chat }
  }

  //진영 변경 투표
  async switchTeam(battleId: string, userId: string, team: BattleTeam): Promise<void> {
    const battleStateResult = await this.stateRepo.loadBattleState(battleId)
    const state: ActiveBattleState = battleStateResult.state
    this.teamSwitchService.applyTeamVote(state, userId, team)
    await this.stateRepo.saveBattleState(battleId, state)
  }
}
