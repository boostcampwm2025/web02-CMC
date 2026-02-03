import { Injectable } from '@nestjs/common'
import { Server } from 'socket.io'
import { EventEmitter } from 'node:events'
import { BattleBroadcasterPort } from '../../../application/ports/out/battleBroadcaster.port'
import { BattlePhaseResponseDto, BattleRoundResponseDto } from '../../../dto/battleTurnResponse.dto'
import { BattleUserUpdateResponseDto } from '../../../dto/battleUserUpdateResponse.dto'
import { BattleTeamUpdateAllResponseDto } from '../../../dto/battleTeamUpdateAllResponse.dto'
import { BattleClosedResponseDto } from '../../../dto/battleClosedResponse.dto'
import { DiscussionVoteResultDto } from '../../../dto/discussionVoteResult.dto'

@Injectable()
export class BattleBroadcasterAdapter extends EventEmitter implements BattleBroadcasterPort {
  constructor(private readonly server: Server) {
    super()
  }

  emitPhaseUpdated(phaseRes: BattlePhaseResponseDto): void {
    const battleRoomId = `battle:${phaseRes.battleId}`
    this.server.to(battleRoomId).emit('battle:phase:updated', phaseRes)
    this.emit('battle:phase:updated', phaseRes)
  }

  emitRoundUpdated(roundRes: BattleRoundResponseDto): void {
    const battleRoomId = `battle:${roundRes.battleId}`
    this.server.to(battleRoomId).emit('battle:round:updated', roundRes)
    this.emit('battle:round:updated', roundRes)
  }

  emitUserUpdated(userRes: BattleUserUpdateResponseDto): void {
    const battleRoomId = `battle:${userRes.battleId}`
    this.server.to(battleRoomId).emit('battle:user:updated', userRes)
    this.emit('battle:user:updated', userRes)
  }

  emitTeamUpdated(teamRes: BattleTeamUpdateAllResponseDto): void {
    const battleRoomId = `battle:${teamRes.battleId}`
    this.server.to(battleRoomId).emit('battle:team:updated', teamRes)
    this.emit('battle:team:updated', teamRes)
  }

  emitBattleClosed(closedRes: BattleClosedResponseDto): void {
    const battleRoomId = `battle:${closedRes.battleId}`
    const battleARoomId = `battle:${closedRes.battleId}:A`
    const battleBRoomId = `battle:${closedRes.battleId}:B`

    this.server.to(battleRoomId).emit('battle:closed', closedRes)
    this.emit('battle:closed', closedRes)

    const rooms = [battleRoomId, battleARoomId, battleBRoomId]
    rooms.forEach(room => this.server.in(room).disconnectSockets(true))
  }

  emitPhaseSkipped(battleId: string): void {
    const battleRoomId = `battle:${battleId}`
    this.server.to(battleRoomId).emit('battle:phase:skipped')
    this.emit('battle:phase:skipped', { battleId })
  }

  emitAttacked(attackedRes: DiscussionVoteResultDto): void {
    const battleRoomId = `battle:${attackedRes.battleId}`
    this.server.to(battleRoomId).emit('battle:attacked', attackedRes)
    this.emit('battle:attacked', attackedRes)
  }

  emitDefensed(defensedRes: DiscussionVoteResultDto): void {
    const battleRoomId = `battle:${defensedRes.battleId}`
    this.server.to(battleRoomId).emit('battle:defensed', defensedRes)
    this.emit('battle:defensed', defensedRes)
  }
}
