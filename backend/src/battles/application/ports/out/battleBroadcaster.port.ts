import { BattlePhaseResponseDto, BattleRoundResponseDto } from '../../../dto/battleTurnResponse.dto'
import { BattleUserUpdateResponseDto } from '../../../dto/battleUserUpdateResponse.dto'
import { BattleTeamUpdateAllResponseDto } from '../../../dto/battleTeamUpdateAllResponse.dto'
import { BattleClosedResponseDto } from '../../../dto/battleClosedResponse.dto'
import { DiscussionVoteResultDto } from '../../../dto/discussionVoteResult.dto'
import type { BattleDiscussion, BattleTeam } from '../../../domains/models/types/battle.types'

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
  on(event: string, listener: (...args: any[]) => void): void
}
