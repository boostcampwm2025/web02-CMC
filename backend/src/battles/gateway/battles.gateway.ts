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
import { BattleJoinRequestDto } from '../dto/battle-join-request.dto'

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
    // if (client.data.battleId) {
    //   this.leaveBattle(client)
    // }
    this.logger.log(`[소켓 연결 해제] - ${client.id}`)

    client.disconnect()
  }

  @SubscribeMessage('battle:join')
  async joinBattle(@MessageBody() battleJoinRequestDto: BattleJoinRequestDto, @ConnectedSocket() client: Socket) {
    try {
      const { battleId } = battleJoinRequestDto
      // const result = await this.battlesService.joinBattle(joinBattleDto, client.id, client.data.user.id)
      const battleState = this.battlesService.joinBattle(battleJoinRequestDto)

      await client.join(`battle:${battleId}`)

      // client.data.battleId = battleId
      // client.data.team = team

      client.emit('battle:joined', battleState)

      client.to(`battle:${battleId}`).emit('battle:joined', { ...battleState, participantId: client.id })
    } catch (error) {
      if (error instanceof Error) {
        client.emit('battle:join:error', {
          message: error.message,
        })
      }
    }
  }
}
