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
import { BATTLE_SERVER_EVENTS } from '@cmc/types'

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
    const battleRoomId = `battle:${phaseRes.battleId}`
    this.io.to(battleRoomId).emit(BATTLE_SERVER_EVENTS.PHASE_UPDATED, phaseRes)
    this.emit(BATTLE_SERVER_EVENTS.PHASE_UPDATED, phaseRes)
  }

  emitRoundUpdated(roundRes: BattleRoundResponseDto): void {
    const battleRoomId = `battle:${roundRes.battleId}`
    this.io.to(battleRoomId).emit(BATTLE_SERVER_EVENTS.ROUND_UPDATED, roundRes)
    this.emit(BATTLE_SERVER_EVENTS.ROUND_UPDATED, roundRes)
  }

  emitUserUpdated(userRes: BattleUserUpdateResponseDto): void {
    const battleRoomId = `battle:${userRes.battleId}`
    this.io.to(battleRoomId).emit(BATTLE_SERVER_EVENTS.USER_UPDATED, userRes)
    this.emit(BATTLE_SERVER_EVENTS.USER_UPDATED, userRes)
  }

  emitTeamUpdated(teamRes: BattleTeamUpdateAllResponseDto): void {
    const battleRoomId = `battle:${teamRes.battleId}`
    this.io.to(battleRoomId).emit(BATTLE_SERVER_EVENTS.TEAM_UPDATED, teamRes)
    this.emit(BATTLE_SERVER_EVENTS.TEAM_UPDATED, teamRes)
  }

  emitBattleClosed(closedRes: BattleClosedResponseDto): void {
    const battleRoomId = getBattleRoomId(closedRes.battleId)
    const battleARoomId = getBattleRoomId(closedRes.battleId, 'A')
    const battleBRoomId = getBattleRoomId(closedRes.battleId, 'B')

    this.io.to(battleRoomId).emit(BATTLE_SERVER_EVENTS.CLOSED, closedRes)
    this.emit(BATTLE_SERVER_EVENTS.CLOSED, closedRes)

    const rooms = [battleRoomId, battleARoomId, battleBRoomId]
    rooms.forEach(room => this.io.in(room).disconnectSockets(true))
  }

  emitPhaseSkipped(battleId: string): void {
    const battleRoomId = `battle:${battleId}`
    this.io.to(battleRoomId).emit(BATTLE_SERVER_EVENTS.PHASE_SKIPPED)
    this.emit(BATTLE_SERVER_EVENTS.PHASE_SKIPPED, { battleId })
  }

  emitAttacked(attackedRes: DiscussionVoteResultDto): void {
    const battleRoomId = `battle:${attackedRes.battleId}`
    this.io.to(battleRoomId).emit(BATTLE_SERVER_EVENTS.ATTACKED, attackedRes)
    this.emit(BATTLE_SERVER_EVENTS.ATTACKED, attackedRes)
  }

  emitDefensed(defensedRes: DiscussionVoteResultDto): void {
    const battleRoomId = `battle:${defensedRes.battleId}`
    this.io.to(battleRoomId).emit(BATTLE_SERVER_EVENTS.DEFENSED, defensedRes)
    this.emit(BATTLE_SERVER_EVENTS.DEFENSED, defensedRes)
  }
}
