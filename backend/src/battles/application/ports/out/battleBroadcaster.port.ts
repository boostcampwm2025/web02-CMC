import { BattlePhaseResponseDto, BattleRoundResponseDto } from '../../../dto/battleTurnResponse.dto'
import { BattleUserUpdateResponseDto } from '../../../dto/battleUserUpdateResponse.dto'
import { BattleTeamUpdateAllResponseDto } from '../../../dto/battleTeamUpdateAllResponse.dto'
import { BattleClosedResponseDto } from '../../../dto/battleClosedResponse.dto'
import { DiscussionVoteResultDto } from '../../../dto/discussionVoteResult.dto'

export interface BattleBroadcasterPort {
  emitPhaseUpdated(phaseRes: BattlePhaseResponseDto): void
  emitRoundUpdated(roundRes: BattleRoundResponseDto): void
  emitUserUpdated(userRes: BattleUserUpdateResponseDto): void
  emitTeamUpdated(teamRes: BattleTeamUpdateAllResponseDto): void
  emitBattleClosed(closedRes: BattleClosedResponseDto): void
  emitPhaseSkipped(battleId: string): void
  emitAttacked(attackedRes: DiscussionVoteResultDto): void
  emitDefensed(defensedRes: DiscussionVoteResultDto): void
  on(event: string, listener: (...args: any[]) => void): void
}
