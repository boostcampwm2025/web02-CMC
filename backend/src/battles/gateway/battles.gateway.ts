import { Logger } from '@nestjs/common'
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
import { BattleChatDto } from '../dto/battleChat.dto'
import { BATTLE_CHAT_SCOPE } from '../const/battles.const'

@WebSocketGateway()
export class BattlesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(BattlesGateway.name)

  constructor(private readonly battlesService: BattlesService) {}

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

      client.to(battleRoomId).emit('battle:joined', { ...res, participantId: client.id })
      client.to(battleTeamRoom).emit('battle:joined', { ...res, participantId: client.id })
    } catch (error) {
      if (error instanceof Error) {
        client.emit('battle:join:error', {
          message: error.message,
        })
      }
    }
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

      this.server.to(roomId).emit('battle:chatUpdate', saved)
    } catch (error) {
      if (error instanceof Error) {
        client.emit('battle:chat:error', { message: error.message })
      }
    }
  }
}
