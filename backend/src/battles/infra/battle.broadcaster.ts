import { Injectable } from '@nestjs/common'
import { EventEmitter } from 'node:events'
import { BattlePhaseResponseDto, BattleRoundResponseDto } from '../dto/battleTurnResponse.dto'
import { BattleUserUpdateResponseDto } from '../dto/battleUserUpdateResponse.dto'
import { BattleTeamUpdateAllResponseDto } from '../dto/battleTeamUpdateAllResponse.dto'
import { BattleClosedResponseDto } from '../dto/battleClosedResponse.dto'
import { DiscussionVoteResultDto } from '../dto/discussionVoteResult.dto'

@Injectable()
export class BattleBroadcaster extends EventEmitter {
  emitPhaseUpdated(phaseRes: BattlePhaseResponseDto): void {
    this.emit('battle:phase:updated', phaseRes)
  }

  emitRoundUpdated(roundRes: BattleRoundResponseDto): void {
    this.emit('battle:round:updated', roundRes)
  }

  emitUserUpdated(userRes: BattleUserUpdateResponseDto): void {
    this.emit('battle:user:updated', userRes)
  }

  emitTeamUpdated(teamRes: BattleTeamUpdateAllResponseDto): void {
    this.emit('battle:team:updated', teamRes)
  }

  emitBattleClosed(closedRes: BattleClosedResponseDto): void {
    this.emit('battle:closed', closedRes)
  }

  emitPhaseSkipped(battleId: string): void {
    this.emit('battle:phase:skipped', { battleId })
  }

  emitAttacked(attackedRes: DiscussionVoteResultDto): void {
    this.emit('battle:attacked', attackedRes)
  }

  emitDefensed(defensedRes: DiscussionVoteResultDto): void {
    this.emit('battle:defensed', defensedRes)
  }
}
