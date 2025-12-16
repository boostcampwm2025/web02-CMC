import { Logger } from '@nestjs/common'
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets'
import { BattlesService } from './battles.service'
import { JoinBattleDto } from './dto/join-battle.dto'
import { Socket, Server } from 'socket.io'

@WebSocketGateway()
export class BattlesGateway {
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
  async joinBattle(@MessageBody() joinBattleDto: JoinBattleDto, @ConnectedSocket() client: Socket) {
    try {
      const { battleId } = joinBattleDto
      // const result = await this.battlesService.joinBattle(joinBattleDto, client.id, client.data.user.id)
      const battleState = this.battlesService.joinBattle(joinBattleDto)

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
