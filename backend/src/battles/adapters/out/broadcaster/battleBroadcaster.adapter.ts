import { Injectable } from '@nestjs/common'
import { Server } from 'socket.io'
import { EventEmitter } from 'node:events'
import { getBattleRoomId } from '../../../domains/services/utils/battle.util'
import { BattleBroadcasterPort } from '../../../application/ports/out/battleBroadcaster.port'
import { BattlePhaseResponseDto, BattleRoundResponseDto } from '../../../dto/battleTurnResponse.dto'
import { BattleUserUpdateResponseDto } from '../../../dto/battleUserUpdateResponse.dto'
import { BattleTeamUpdateAllResponseDto } from '../../../dto/battleTeamUpdateAllResponse.dto'
import { BattleClosedResponseDto } from '../../../dto/battleClosedResponse.dto'
import { DiscussionVoteResultDto } from '../../../dto/discussionVoteResult.dto'

@Injectable()
export class BattleBroadcasterAdapter extends EventEmitter implements BattleBroadcasterPort {
  private server?: Server

  setServer(server: Server) {
    this.server = server
  }

  private get io(): Server {
    if (!this.server) {
      throw new Error('Socket server not initialized. Ensure BattlesGateway.afterInit() calls setServer().')
    }
    return this.server
  }

  emitPhaseUpdated(phaseRes: BattlePhaseResponseDto): void {
    const battleRoomId = getBattleRoomId(phaseRes.battleId)
    this.io.to(battleRoomId).emit('battle:phase:updated', phaseRes)
    this.emit('battle:phase:updated', phaseRes)
  }

  emitRoundUpdated(roundRes: BattleRoundResponseDto): void {
    const battleRoomId = getBattleRoomId(roundRes.battleId)
    this.io.to(battleRoomId).emit('battle:round:updated', roundRes)
    this.emit('battle:round:updated', roundRes)
  }

  emitUserUpdated(userRes: BattleUserUpdateResponseDto): void {
    const battleRoomId = getBattleRoomId(userRes.battleId)
    this.io.to(battleRoomId).emit('battle:user:updated', userRes)
    this.emit('battle:user:updated', userRes)
  }

  emitTeamUpdated(teamRes: BattleTeamUpdateAllResponseDto): void {
    const battleRoomId = getBattleRoomId(teamRes.battleId)
    this.io.to(battleRoomId).emit('battle:team:updated', teamRes)
    this.emit('battle:team:updated', teamRes)
  }

  emitBattleClosed(closedRes: BattleClosedResponseDto): void {
    const battleRoomId = getBattleRoomId(closedRes.battleId)
    const battleARoomId = getBattleRoomId(closedRes.battleId, 'A')
    const battleBRoomId = getBattleRoomId(closedRes.battleId, 'B')

    this.io.to(battleRoomId).emit('battle:closed', closedRes)
    this.emit('battle:closed', closedRes)

    const rooms = [battleRoomId, battleARoomId, battleBRoomId]
    rooms.forEach(room => this.io.in(room).disconnectSockets(true))
  }

  emitPhaseSkipped(battleId: string): void {
    const battleRoomId = getBattleRoomId(battleId)
    this.io.to(battleRoomId).emit('battle:phase:skipped')
    this.emit('battle:phase:skipped', { battleId })
  }

  emitAttacked(attackedRes: DiscussionVoteResultDto): void {
    const battleRoomId = getBattleRoomId(attackedRes.battleId)
    this.io.to(battleRoomId).emit('battle:attacked', attackedRes)
    this.emit('battle:attacked', attackedRes)
  }

  emitDefensed(defensedRes: DiscussionVoteResultDto): void {
    const battleRoomId = getBattleRoomId(defensedRes.battleId)
    this.io.to(battleRoomId).emit('battle:defensed', defensedRes)
    this.emit('battle:defensed', defensedRes)
  }
}
