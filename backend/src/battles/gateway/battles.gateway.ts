import { Logger, OnModuleInit } from '@nestjs/common'
import { Socket, Server } from 'socket.io'

import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { BattlesService } from '../service/battles.service'
import { BattleJoinRequestDto } from '../dto/battleJoinRequest.dto'
import { BattleJoinResponseDto } from '../dto/battleJoinResponse.dto'
import { AttackRequestDto, DefenseRequestDto, AttackVoteRequestDto, DefenseVoteRequestDto } from '../dto/discussion.dto'
import { BattlePhaseResponseDto, BattleRoundResponseDto } from '../dto/battleTurnResponse.dto'
import { BattleChatDto } from '../dto/battleChat.dto'
import { BATTLE_CHAT_SCOPE } from '../const/battles.const'
import { DiscussionVoteResultDto } from '../dto/discussionVoteResult.dto'
import { BattleTeamVoteDto } from '../dto/battleTeamVote.dto'
import { BattleClosedResponseDto } from '../dto/battleClosedResponse.dto'
import { BattleTeamUpdateAllResponseDto } from '../dto/battleTeamUpdateAllResponse.dto'
import { BattleUserUpdateResponseDto } from '../dto/battleUserUpdateResponse.dto'

@WebSocketGateway()
export class BattlesGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(BattlesGateway.name)

  constructor(private readonly battlesService: BattlesService) {}

  onModuleInit() {
    this.bindBattleEvents()
  }

  handleConnection(client: Socket) {
    this.logger.log(`[소켓 연결] - ${client.id}`)

    try {
      // const token = client.handshake.auth.token
      // const user = this.authService.verifyToken(token)
      // client.data.user = user
    } catch {
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[소켓 연결 해제] - ${client.id}`)

    client.disconnect()
  }

  @SubscribeMessage('battle:join')
  async joinBattle(@MessageBody() battleJoinRequestDto: BattleJoinRequestDto, @ConnectedSocket() client: Socket) {
    try {
      const { battleId } = battleJoinRequestDto
      const { battleState, team } = this.battlesService.joinBattle(battleJoinRequestDto, client.id)

      const res = BattleJoinResponseDto.of(battleState, team)
      const battleRoomId = this.battlesService.getBattleRoomId(battleId)
      const battleTeamRoom = this.battlesService.getBattleRoomId(battleId, team)

      await client.join(battleRoomId)
      await client.join(battleTeamRoom)

      client.emit('battle:joined', { ...res })
    } catch (error) {
      if (error instanceof Error) {
        client.emit('battle:join:error', {
          message: error.message,
        })
      }
    }
  }

  @SubscribeMessage('battle:attack')
  handleAttack(@MessageBody() dto: AttackRequestDto, @ConnectedSocket() client: Socket) {
    try {
      const { battleId, authorId, content, team } = dto
      const attack = this.battlesService.handleAttack(battleId, { authorId, content, team })
      const teamRoom = this.battlesService.getBattleRoomId(battleId, team)

      this.server.to(teamRoom).emit('battle:attack:created', attack)
    } catch (error) {
      if (error instanceof Error) {
        client.emit('battle:attack:error', {
          message: error.message,
        })
      }
    }
  }

  @SubscribeMessage('battle:defense')
  handleDefense(@MessageBody() dto: DefenseRequestDto, @ConnectedSocket() client: Socket) {
    try {
      const { battleId, authorId, content, team } = dto
      const defense = this.battlesService.handleDefense(battleId, { authorId, content, team })
      const teamRoom = this.battlesService.getBattleRoomId(battleId, team)

      this.server.to(teamRoom).emit('battle:defense:created', defense)
    } catch (error) {
      if (error instanceof Error) {
        client.emit('battle:defense:error', {
          message: error.message,
        })
      }
    }
  }

  @SubscribeMessage('battle:attack:vote')
  handleAttackVote(@MessageBody() dto: AttackVoteRequestDto, @ConnectedSocket() client: Socket) {
    try {
      const { battleId, discussionId, userId, team } = dto
      const updates = this.battlesService.handleAttackVote(battleId, discussionId, { userId, team })
      const teamRoom = this.battlesService.getBattleRoomId(battleId, team)

      // 모든 변경된 항목(기존 투표 취소 + 새 투표)을 전송
      updates.forEach(update => {
        this.server.to(teamRoom).emit('battle:attack:voted', update)
      })
    } catch (error) {
      if (error instanceof Error) {
        client.emit('battle:attack:vote:error', {
          message: error.message,
        })
      }
    }
  }

  @SubscribeMessage('battle:defense:vote')
  handleDefenseVote(@MessageBody() dto: DefenseVoteRequestDto, @ConnectedSocket() client: Socket) {
    try {
      const { battleId, discussionId, userId, team } = dto
      const updates = this.battlesService.handleDefenseVote(battleId, discussionId, { userId, team })
      const teamRoom = this.battlesService.getBattleRoomId(battleId, team)

      // 모든 변경된 항목(기존 투표 취소 + 새 투표)을 전송
      updates.forEach(update => {
        this.server.to(teamRoom).emit('battle:defense:voted', update)
      })
    } catch (error) {
      if (error instanceof Error) {
        client.emit('battle:defense:vote:error', {
          message: error.message,
        })
      }
    }
  }

  phaseUpdate(payload: BattlePhaseResponseDto) {
    const { battleId } = payload
    const battleRoomId = this.battlesService.getBattleRoomId(battleId)

    this.server.to(battleRoomId).emit('battle:phase:updated', payload)
  }

  roundUpdate(payload: BattleRoundResponseDto) {
    const { battleId } = payload
    const battleRoomId = this.battlesService.getBattleRoomId(battleId)

    this.server.to(battleRoomId).emit('battle:round:updated', payload)
  }

  onAttacked(payload: DiscussionVoteResultDto) {
    const { battleId } = payload
    const battleRoomId = this.battlesService.getBattleRoomId(battleId)

    this.server.to(battleRoomId).emit('battle:attacked', payload)
  }

  onDefensed(payload: DiscussionVoteResultDto) {
    const { battleId } = payload
    const battleRoomId = this.battlesService.getBattleRoomId(battleId)

    this.server.to(battleRoomId).emit('battle:defensed', payload)
  }

  closeBattle(payload: BattleClosedResponseDto) {
    const { battleId } = payload
    const battleRoomId = this.battlesService.getBattleRoomId(battleId)
    const battleARoomId = this.battlesService.getBattleRoomId(battleId, 'A')
    const battleBRoomId = this.battlesService.getBattleRoomId(battleId, 'B')

    this.server.to(battleRoomId).emit('battle:closed', payload)

    const rooms = [battleRoomId, battleARoomId, battleBRoomId]

    rooms.forEach(room => this.server.in(room).disconnectSockets(true))
  }

  userUpdate(payload: BattleUserUpdateResponseDto) {
    const { battleId } = payload
    const battleRoomId = this.battlesService.getBattleRoomId(battleId)

    this.server.to(battleRoomId).emit('battle:user:update', payload)
  }

  private bindBattleEvents() {
    this.battlesService.on('battle:phase:updated', (payload: BattlePhaseResponseDto) => this.phaseUpdate(payload))

    this.battlesService.on('battle:round:updated', (payload: BattleRoundResponseDto) => this.roundUpdate(payload))

    this.battlesService.on('battle:attacked', (payload: DiscussionVoteResultDto) => this.onAttacked(payload))

    this.battlesService.on('battle:defensed', (payload: DiscussionVoteResultDto) => this.onDefensed(payload))

    this.battlesService.on('battle:team:update', (payload: BattleTeamUpdateAllResponseDto) => this.teamUpdate(payload))

    this.battlesService.on('battle:user:update', (payload: BattleUserUpdateResponseDto) => this.userUpdate(payload))
    // this.battlesService.on('battle:ended', payload => {
    //   const { battleId } = payload
    //   this.server.to(`battle:${battleId}`).emit('battle:ended', payload)
    // })
    this.battlesService.on('battle:closed', (payload: BattleClosedResponseDto) => this.closeBattle(payload))
  }

  @SubscribeMessage('battle:chat')
  handleChat(@MessageBody() battleChatDto: BattleChatDto, @ConnectedSocket() client: Socket) {
    try {
      const senderId = client.id
      const saved = this.battlesService.appendChatMessage(battleChatDto, senderId)
      const roomId =
        battleChatDto.scope === BATTLE_CHAT_SCOPE.ALL
          ? this.battlesService.getBattleRoomId(battleChatDto.battleId)
          : this.battlesService.getBattleRoomId(battleChatDto.battleId, battleChatDto.team)

      // this.server.to(roomId).emit('battle:chatted', saved)
      this.server.to(roomId).except(client.id).emit('battle:chatted', saved)
    } catch (error) {
      if (error instanceof Error) {
        client.emit('battle:chat:error', { message: error.message })
      }
    }
  }

  @SubscribeMessage('battle:team:vote')
  handleTeamVote(@MessageBody() dto: BattleTeamVoteDto, @ConnectedSocket() client: Socket) {
    try {
      this.battlesService.voteTeam(dto, client.id)
    } catch (error) {
      if (error instanceof Error) {
        client.emit('battle:team:vote:error', { message: error.message })
      }
    }
  }

  private teamUpdate(payload: BattleTeamUpdateAllResponseDto) {
    const battleRoomId = this.battlesService.getBattleRoomId(payload.battleId)

    // 각 클라이언트의 소켓 룸 이동 및 개별 알림
    for (const change of payload.changes) {
      const socket = this.server.sockets.sockets.get(change.clientId)
      if (!socket) continue

      const fromRoom = this.battlesService.getBattleRoomId(payload.battleId, change.from)
      const toRoom = this.battlesService.getBattleRoomId(payload.battleId, change.to)

      void socket.leave(fromRoom)
      void socket.join(toRoom)
      socket.emit('battle:team:update', { battleId: payload.battleId, team: change.to })
    }

    this.server.to(battleRoomId).emit('battle:team:update:all', payload)
  }
}
