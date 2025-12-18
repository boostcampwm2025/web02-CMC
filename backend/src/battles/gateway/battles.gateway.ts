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
import { BattlePhaseResponseDto, BattleRoundResponseDto, BattleTurnResponseDto } from '../dto/battleTurnResponse.dto'
import { BattleChatDto } from '../dto/battleChat.dto'
import { BATTLE_CHAT_SCOPE } from '../const/battles.const'

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

  @SubscribeMessage('Battle:Attack')
  handleAttack(@MessageBody() dto: AttackRequestDto, @ConnectedSocket() client: Socket) {
    try {
      const { battleId, authorId, content, team } = dto
      const attack = this.battlesService.handleAttack(battleId, { authorId, content, team })
      const teamRoom = this.battlesService.getBattleRoomId(battleId, team)

      this.server.to(teamRoom).emit('Battle:NewAttack', attack)
    } catch (error) {
      if (error instanceof Error) {
        client.emit('Battle:Attack:Error', {
          message: error.message,
        })
      }
    }
  }

  @SubscribeMessage('Battle:Defense')
  handleDefense(@MessageBody() dto: DefenseRequestDto, @ConnectedSocket() client: Socket) {
    try {
      const { battleId, authorId, content, team } = dto
      const defense = this.battlesService.handleDefense(battleId, { authorId, content, team })
      const teamRoom = this.battlesService.getBattleRoomId(battleId, team)

      this.server.to(teamRoom).emit('Battle:NewDefense', defense)
    } catch (error) {
      if (error instanceof Error) {
        client.emit('Battle:Defense:Error', {
          message: error.message,
        })
      }
    }
  }

  @SubscribeMessage('Battle:AttackVote')
  handleAttackVote(@MessageBody() dto: AttackVoteRequestDto, @ConnectedSocket() client: Socket) {
    try {
      const { battleId, discussionId, userId, team } = dto
      const attack = this.battlesService.handleAttackVote(battleId, discussionId, { userId, team })
      const teamRoom = this.battlesService.getBattleRoomId(battleId, team)

      this.server.to(teamRoom).emit('Battle:AttackVoteUpdate', attack)
    } catch (error) {
      if (error instanceof Error) {
        client.emit('Battle:AttackVote:Error', {
          message: error.message,
        })
      }
    }
  }

  @SubscribeMessage('Battle:DefenseVote')
  handleDefenseVote(@MessageBody() dto: DefenseVoteRequestDto, @ConnectedSocket() client: Socket) {
    try {
      const { battleId, discussionId, userId, team } = dto
      const defense = this.battlesService.handleDefenseVote(battleId, discussionId, { userId, team })
      const teamRoom = this.battlesService.getBattleRoomId(battleId, team)

      this.server.to(teamRoom).emit('Battle:DefenseVoteUpdate', defense)
    } catch (error) {
      if (error instanceof Error) {
        client.emit('Battle:DefenseVote:Error', {
          message: error.message,
        })
  turnUpdate(payload: BattleTurnResponseDto) {
    const { battleId } = payload
    const battleRoomId = this.battlesService.getBattleRoomId(battleId)

    this.server.to(battleRoomId).emit('battle:turn:update', payload)
  }

  phaseUpdate(payload: BattlePhaseResponseDto) {
    const { battleId } = payload
    const battleRoomId = this.battlesService.getBattleRoomId(battleId)

    this.server.to(battleRoomId).emit('battle:phase:update', payload)
  }

  roundUpdate(payload: BattleRoundResponseDto) {
    const { battleId } = payload
    const battleRoomId = this.battlesService.getBattleRoomId(battleId)

    this.server.to(battleRoomId).emit('battle:round:update', payload)
  }

  private bindBattleEvents() {
    this.battlesService.on('battle:phase:update', (payload: BattlePhaseResponseDto) => this.phaseUpdate(payload))

    this.battlesService.on('battle:turn:update', (payload: BattleTurnResponseDto) => this.turnUpdate(payload))

    this.battlesService.on('battle:round:update', (payload: BattleRoundResponseDto) => this.roundUpdate(payload))

    // this.battlesService.on('battle:ended', payload => {
    //   const { battleId } = payload
    //   this.server.to(`battle:${battleId}`).emit('battle:ended', payload)
    // })
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
