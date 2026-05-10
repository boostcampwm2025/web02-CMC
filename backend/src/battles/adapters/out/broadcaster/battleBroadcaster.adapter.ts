import { Injectable } from '@nestjs/common'
import { Server } from 'socket.io'
import { EventEmitter } from 'node:events'
import { getBattleRoomId } from '../../../domains/services/utils/battle.util'
import { BattleBroadcasterPort, BattleChatBroadcastPayload } from '../../../application/ports/out/battleBroadcaster.port'
import { BATTLE_CHAT_SCOPE } from '../../../domains/models/const/battles.const'
import { BattlePhaseResponseDto, BattleRoundResponseDto } from '../../../dto/battleTurnResponse.dto'
import { BattleUserUpdateResponseDto } from '../../../dto/battleUserUpdateResponse.dto'
import { BattleTeamUpdateAllResponseDto } from '../../../dto/battleTeamUpdateAllResponse.dto'
import { BattleClosedResponseDto } from '../../../dto/battleClosedResponse.dto'
import { DiscussionVoteResultDto } from '../../../dto/discussionVoteResult.dto'
import type { BattleDiscussion, BattleTeam } from '../../../domains/models/types/battle.types'
import { DiscussionVoteResponseDto } from '../../../dto/discussionVoteResponse.dto'
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
    const battleRoomId = getBattleRoomId(phaseRes.battleId)
    this.io.to(battleRoomId).emit(BATTLE_SERVER_EVENTS.PHASE_UPDATED, phaseRes)
    this.emit('battle:phase:updated', phaseRes)
  }

  emitRoundUpdated(roundRes: BattleRoundResponseDto): void {
    const battleRoomId = getBattleRoomId(roundRes.battleId)
    this.io.to(battleRoomId).emit(BATTLE_SERVER_EVENTS.ROUND_UPDATED, roundRes)
    this.emit('battle:round:updated', roundRes)
  }

  emitUserUpdated(userRes: BattleUserUpdateResponseDto): void {
    const battleRoomId = getBattleRoomId(userRes.battleId)
    this.io.to(battleRoomId).emit(BATTLE_SERVER_EVENTS.USER_UPDATED, userRes)
    this.emit('battle:user:updated', userRes)
  }

  emitTeamUpdated(teamRes: BattleTeamUpdateAllResponseDto): void {
    const battleRoomId = getBattleRoomId(teamRes.battleId)
    this.io.to(battleRoomId).emit(BATTLE_SERVER_EVENTS.TEAM_UPDATED, teamRes)
    this.emit('battle:team:updated', teamRes)
  }

  emitBattleClosed(closedRes: BattleClosedResponseDto): void {
    const battleRoomId = getBattleRoomId(closedRes.battleId)
    const battleARoomId = getBattleRoomId(closedRes.battleId, 'A')
    const battleBRoomId = getBattleRoomId(closedRes.battleId, 'B')

    this.io.to(battleRoomId).emit(BATTLE_SERVER_EVENTS.CLOSED, closedRes)
    this.emit('battle:closed', closedRes)

    const rooms = [battleRoomId, battleARoomId, battleBRoomId]
    rooms.forEach(room => this.io.in(room).disconnectSockets(true))
  }

  emitPhaseSkipped(battleId: string): void {
    const battleRoomId = getBattleRoomId(battleId)
    this.io.to(battleRoomId).emit(BATTLE_SERVER_EVENTS.PHASE_SKIPPED)
    this.emit('battle:phase:skipped', { battleId })
  }

  emitAttacked(attackedRes: DiscussionVoteResultDto): void {
    const battleRoomId = getBattleRoomId(attackedRes.battleId)
    this.io.to(battleRoomId).emit(BATTLE_SERVER_EVENTS.ATTACKED, attackedRes)
    this.emit('battle:attacked', attackedRes)
  }

  emitDefensed(defensedRes: DiscussionVoteResultDto): void {
    const battleRoomId = getBattleRoomId(defensedRes.battleId)
    this.io.to(battleRoomId).emit(BATTLE_SERVER_EVENTS.DEFENSED, defensedRes)
    this.emit('battle:defensed', defensedRes)
  }

  emitAttackCreated(battleId: string, team: BattleTeam, discussion: BattleDiscussion): void {
    const teamRoom = getBattleRoomId(battleId, team)
    this.io.to(teamRoom).emit(BATTLE_SERVER_EVENTS.ATTACK_CREATED, discussion)
    this.emit('battle:attack:created', { battleId, team, discussion })
  }

  emitDefenseCreated(battleId: string, team: BattleTeam, discussion: BattleDiscussion): void {
    const teamRoom = getBattleRoomId(battleId, team)
    this.io.to(teamRoom).emit(BATTLE_SERVER_EVENTS.DEFENSE_CREATED, discussion)
    this.emit('battle:defense:created', { battleId, team, discussion })
  }

  emitAttackVoted(battleId: string, team: BattleTeam, voteRes: DiscussionVoteResponseDto): void {
    const teamRoom = getBattleRoomId(battleId, team)
    this.io.to(teamRoom).emit(BATTLE_SERVER_EVENTS.ATTACK_VOTED, voteRes)
    this.emit('battle:attack:voted', { battleId, team, voteRes })
  }

  emitDefenseVoted(battleId: string, team: BattleTeam, voteRes: DiscussionVoteResponseDto): void {
    const teamRoom = getBattleRoomId(battleId, team)
    this.io.to(teamRoom).emit(BATTLE_SERVER_EVENTS.DEFENSE_VOTED, voteRes)
    this.emit('battle:defense:voted', { battleId, team, voteRes })
  }

  emitChatted(payload: BattleChatBroadcastPayload): void {
    const roomId = payload.scope === BATTLE_CHAT_SCOPE.ALL ? getBattleRoomId(payload.battleId) : getBattleRoomId(payload.battleId, payload.team)
    this.io.to(roomId).emit(BATTLE_SERVER_EVENTS.CHATTED, payload)
    this.emit('battle:chatted', payload)
  }
}
