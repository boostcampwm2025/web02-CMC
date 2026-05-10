import { BattlePhaseResponseDto, BattleRoundResponseDto } from '../../../dto/battleTurnResponse.dto'
import { BattleUserUpdateResponseDto } from '../../../dto/battleUserUpdateResponse.dto'
import { BattleTeamUpdateAllResponseDto } from '../../../dto/battleTeamUpdateAllResponse.dto'
import { BattleClosedResponseDto } from '../../../dto/battleClosedResponse.dto'
import { BattleLeaveResponseDto } from '../../../dto/battleLeaveResponse.dto'
import { DiscussionVoteResultDto } from '../../../dto/discussionVoteResult.dto'
import type { BattleDiscussion, BattleTeam } from '../../../domains/models/types/battle.types'
import type { DiscussionVoteResponseDto } from '../../../dto/discussionVoteResponse.dto'

export interface BattleChatBroadcastPayload {
  battleId: string
  scope: string
  messageId: string
  team: BattleTeam
  sender: { userId: string; nickname: string; tier?: string }
  text: string
  createdAt: Date
}

export interface BattleBroadcasterPort {
  emitPhaseUpdated(phaseRes: BattlePhaseResponseDto): void
  emitRoundUpdated(roundRes: BattleRoundResponseDto): void
  emitUserUpdated(userRes: BattleUserUpdateResponseDto): void
  emitTeamUpdated(teamRes: BattleTeamUpdateAllResponseDto): void
  emitBattleClosed(closedRes: BattleClosedResponseDto): void
  emitPhaseSkipped(battleId: string): void
  emitAttacked(attackedRes: DiscussionVoteResultDto): void
  emitDefensed(defensedRes: DiscussionVoteResultDto): void
  emitAttackCreated(battleId: string, team: BattleTeam, discussion: BattleDiscussion): void
  emitDefenseCreated(battleId: string, team: BattleTeam, discussion: BattleDiscussion): void
  emitAttackVoted(battleId: string, team: BattleTeam, voteRes: DiscussionVoteResponseDto): void
  emitDefenseVoted(battleId: string, team: BattleTeam, voteRes: DiscussionVoteResponseDto): void
  emitChatted(payload: BattleChatBroadcastPayload): void
  emitLeaved(payload: BattleLeaveResponseDto): void
  emitStarted(battleId: string): void
  on(event: string, listener: (...args: any[]) => void): void
}
