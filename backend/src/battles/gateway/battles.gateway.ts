import { Logger, OnModuleInit, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common'
import { Server } from 'socket.io'
import type { SocketWithUserId } from '../types/socket.types'
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
import { BattleStartDto } from '../dto/battleStart.dto'
import { MetricsService } from '../../metrics/metrics.service'

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class BattlesGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(BattlesGateway.name)
  private readonly userIdToSocketMap = new Map<string, SocketWithUserId>()

  constructor(
    private readonly battlesService: BattlesService,
    private readonly metricsService: MetricsService,
  ) {}

  onModuleInit() {
    this.bindBattleEvents()
  }

  private getUserIdFromSocket(client: SocketWithUserId): string {
    //저장된 userId를 가져옴
    const userId = client.data.userId
    if (!userId) {
      throw new UnauthorizedException('userId가 필요합니다.')
    }
    return userId
  }

  handleConnection(client: SocketWithUserId) {
    this.logger.log(`[소켓 연결] - ${client.id}`)

    try {
      const userId = client.handshake.auth.userId
      if (!userId) {
        throw new UnauthorizedException('userId가 필요합니다.')
      }

      // 인증 성공 시 socket.data.userId에 사용자 정보를 저장
      client.data.userId = userId
      this.userIdToSocketMap.set(userId, client)
      this.metricsService.setActiveSocketConnections(this.userIdToSocketMap.size)
      this.logger.log(`[소켓 연결] userId: ${userId}`)
    } catch {
      this.logger.error(`[소켓 연결 실패] - ${client.id}`)
      client.disconnect()
    }
  }

  async handleDisconnect(client: SocketWithUserId) {
    const userId = client.data.userId
    const battleId = client.data.battleId
    if (userId && battleId) {
      try {
        const result = await this.battlesService.leaveBattle(userId, battleId)
        const battleRoomId = this.battlesService.getBattleRoomId(battleId)
        this.server.to(battleRoomId).emit('battle:leaved', result)
      } catch (error) {
        if (!(error instanceof NotFoundException)) {
          this.logger.error(`[소켓 연결 해제 처리 실패] userId: ${userId}, battleId: ${battleId}`, error as Error)
        }
      } finally {
        client.data.battleId = undefined
      }
    }
    if (userId) {
      this.userIdToSocketMap.delete(userId)
      this.metricsService.setActiveSocketConnections(this.userIdToSocketMap.size)
      this.logger.log(`[소켓 연결 해제] userId: ${userId}`)
    } else {
      this.logger.log(`[소켓 연결 해제] - ${client.id}`)
    }

    client.disconnect()
  }

  @SubscribeMessage('battle:join')
  async joinBattle(@MessageBody() battleJoinRequestDto: BattleJoinRequestDto, @ConnectedSocket() client: SocketWithUserId) {
    const stopTimer = this.metricsService.startSocketTimer('battle:join')
    try {
      const userId = this.getUserIdFromSocket(client)

      const { battleId } = battleJoinRequestDto

      // 비공개 배틀이면 초대 코드로 접근했는지 확인
      const isPrivate = await this.battlesService.isPrivateBattle(battleId)
      if (isPrivate) {
        const cookieHeader = client.handshake.headers.cookie
        const cookieName = `inviteAccess_${battleId}`
        if (!cookieHeader?.includes(cookieName)) {
          throw new ForbiddenException('비공개 배틀에 접근하려면 초대 코드가 필요합니다.')
        }
      }

      const { battleState, team } = await this.battlesService.joinBattle(battleJoinRequestDto, userId)

      const res = BattleJoinResponseDto.of(battleState, team)
      const battleRoomId = this.battlesService.getBattleRoomId(battleId)
      const battleTeamRoom = this.battlesService.getBattleRoomId(battleId, team)

      client.data.battleId = battleId
      await client.join(battleRoomId)
      await client.join(battleTeamRoom)

      client.emit('battle:joined', { ...res })
      stopTimer('success')
    } catch (error) {
      stopTimer('error')
      if (error instanceof Error) {
        client.emit('battle:join:error', {
          message: error.message,
        })
      }
    }
  }

  @SubscribeMessage('battle:leave')
  async handleLeave(@MessageBody() dto: { battleId: string }, @ConnectedSocket() client: SocketWithUserId) {
    const { battleId } = dto
    const userId = this.getUserIdFromSocket(client)
    const battleRoomId = this.battlesService.getBattleRoomId(battleId)

    const result = await this.battlesService.leaveBattle(userId, battleId)
    client.data.battleId = undefined

    this.server.to(battleRoomId).emit('battle:leaved', result)
  }

  @SubscribeMessage('battle:start')
  async handleStart(@MessageBody() dto: BattleStartDto) {
    const stopTimer = this.metricsService.startSocketTimer('battle:start')
    try {
      const { battleId } = dto
      await this.battlesService.startBattle(battleId)

      const battleRoomId = this.battlesService.getBattleRoomId(battleId)

      this.server.to(battleRoomId).emit('battle:started')
      stopTimer('success')
    } catch (error) {
      stopTimer('error')
      throw error
    }
  }

  @SubscribeMessage('battle:attack')
  async handleAttack(@MessageBody() dto: AttackRequestDto, @ConnectedSocket() client: SocketWithUserId) {
    const stopTimer = this.metricsService.startSocketTimer('battle:attack')
    try {
      const userId = this.getUserIdFromSocket(client)
      const { battleId, content, team } = dto
      const attack = await this.battlesService.handleAttack(battleId, { authorId: userId, content, team })
      const teamRoom = this.battlesService.getBattleRoomId(battleId, team)

      this.server.to(teamRoom).emit('battle:attack:created', attack)
      stopTimer('success')
    } catch (error) {
      stopTimer('error')
      if (error instanceof Error) {
        client.emit('battle:attack:error', {
          message: error.message,
        })
      }
    }
  }

  @SubscribeMessage('battle:defense')
  async handleDefense(@MessageBody() dto: DefenseRequestDto, @ConnectedSocket() client: SocketWithUserId) {
    const stopTimer = this.metricsService.startSocketTimer('battle:defense')
    try {
      const userId = this.getUserIdFromSocket(client)
      const { battleId, content, team } = dto
      const defense = await this.battlesService.handleDefense(battleId, { authorId: userId, content, team })
      const teamRoom = this.battlesService.getBattleRoomId(battleId, team)

      this.server.to(teamRoom).emit('battle:defense:created', defense)
      stopTimer('success')
    } catch (error) {
      stopTimer('error')
      if (error instanceof Error) {
        client.emit('battle:defense:error', {
          message: error.message,
        })
      }
    }
  }

  @SubscribeMessage('battle:attack:vote')
  async handleAttackVote(@MessageBody() dto: AttackVoteRequestDto, @ConnectedSocket() client: SocketWithUserId) {
    const stopTimer = this.metricsService.startSocketTimer('battle:attack:vote')
    try {
      const userId = this.getUserIdFromSocket(client)
      const { battleId, discussionId, team } = dto
      const updates = await this.battlesService.handleAttackVote(battleId, discussionId, { userId, team })
      const teamRoom = this.battlesService.getBattleRoomId(battleId, team)

      // 모든 변경된 항목(기존 투표 취소 + 새 투표)을 전송
      updates.forEach(update => {
        this.server.to(teamRoom).emit('battle:attack:voted', update)
      })
      stopTimer('success')
    } catch (error) {
      stopTimer('error')
      if (error instanceof Error) {
        client.emit('battle:attack:vote:error', {
          message: error.message,
        })
      }
    }
  }

  @SubscribeMessage('battle:defense:vote')
  async handleDefenseVote(@MessageBody() dto: DefenseVoteRequestDto, @ConnectedSocket() client: SocketWithUserId) {
    const stopTimer = this.metricsService.startSocketTimer('battle:defense:vote')
    try {
      const userId = this.getUserIdFromSocket(client)
      const { battleId, discussionId, team } = dto
      const updates = await this.battlesService.handleDefenseVote(battleId, discussionId, { userId, team })
      const teamRoom = this.battlesService.getBattleRoomId(battleId, team)

      // 모든 변경된 항목(기존 투표 취소 + 새 투표)을 전송
      updates.forEach(update => {
        this.server.to(teamRoom).emit('battle:defense:voted', update)
      })
      stopTimer('success')
    } catch (error) {
      stopTimer('error')
      if (error instanceof Error) {
        client.emit('battle:defense:vote:error', {
          message: error.message,
        })
      }
    }
  }

  @SubscribeMessage('battle:user:skip')
  async handlePhaseSkip(@MessageBody() dto: { skip: boolean; battleId: string }, @ConnectedSocket() client: SocketWithUserId) {
    const stopTimer = this.metricsService.startSocketTimer('battle:user:skip')
    const userId = this.getUserIdFromSocket(client)
    try {
      const { skip, battleId } = dto
      const totalSkips = await this.battlesService.handlePhaseSkip({ battleId, userId, skip })
      const battleRoomId = this.battlesService.getBattleRoomId(battleId)

      this.server.to(battleRoomId).emit('battle:user:skipped', { totalSkips })

      stopTimer('success')
    } catch (error) {
      stopTimer('error')
      if (error instanceof Error) {
        client.emit('battle:user:skip:error', {
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

    this.server.to(battleRoomId).emit('battle:user:updated', payload)
  }

  skipPhase(payload: { battleId: string }) {
    const { battleId } = payload
    const battleRoomId = this.battlesService.getBattleRoomId(battleId)

    this.server.to(battleRoomId).emit('battle:phase:skipped')
  }

  private bindBattleEvents() {
    this.battlesService.on('battle:phase:updated', (payload: BattlePhaseResponseDto) => this.phaseUpdate(payload))

    this.battlesService.on('battle:round:updated', (payload: BattleRoundResponseDto) => this.roundUpdate(payload))

    this.battlesService.on('battle:attacked', (payload: DiscussionVoteResultDto) => this.onAttacked(payload))

    this.battlesService.on('battle:defensed', (payload: DiscussionVoteResultDto) => this.onDefensed(payload))

    this.battlesService.on('battle:team:updated', (payload: BattleTeamUpdateAllResponseDto) => this.teamUpdate(payload))

    this.battlesService.on('battle:user:updated', (payload: BattleUserUpdateResponseDto) => this.userUpdate(payload))

    this.battlesService.on('battle:phase:skipped', (payload: { battleId: string }) => this.skipPhase(payload))

    this.battlesService.on('battle:closed', (payload: BattleClosedResponseDto) => this.closeBattle(payload))
  }

  @SubscribeMessage('battle:chat')
  async handleChat(@MessageBody() battleChatDto: BattleChatDto, @ConnectedSocket() client: SocketWithUserId) {
    const stopTimer = this.metricsService.startSocketTimer('battle:chat')
    try {
      const userId = this.getUserIdFromSocket(client)

      const saved = await this.battlesService.appendChatMessage(battleChatDto, userId)
      const roomId =
        battleChatDto.scope === BATTLE_CHAT_SCOPE.ALL
          ? this.battlesService.getBattleRoomId(battleChatDto.battleId)
          : this.battlesService.getBattleRoomId(battleChatDto.battleId, battleChatDto.team)

      // this.server.to(roomId).emit('battle:chatted', saved)
      this.server.to(roomId).except(client.id).emit('battle:chatted', saved)
      stopTimer('success')
    } catch (error) {
      stopTimer('error')
      if (error instanceof Error) {
        client.emit('battle:chat:error', { message: error.message })
      }
    }
  }

  @SubscribeMessage('battle:team:vote')
  async handleTeamVote(@MessageBody() dto: BattleTeamVoteDto, @ConnectedSocket() client: SocketWithUserId) {
    const stopTimer = this.metricsService.startSocketTimer('battle:team:vote')
    try {
      const userId = this.getUserIdFromSocket(client)

      await this.battlesService.voteTeam(dto, userId)
      stopTimer('success')
    } catch (error) {
      stopTimer('error')
      if (error instanceof Error) {
        client.emit('battle:team:vote:error', { message: error.message })
      }
    }
  }

  teamUpdate(payload: BattleTeamUpdateAllResponseDto) {
    const battleRoomId = this.battlesService.getBattleRoomId(payload.battleId)

    // 각 클라이언트의 소켓 룸 이동 및 개별 알림
    for (const change of payload.changes) {
      const socket = this.userIdToSocketMap.get(change.userId)
      if (!socket) continue

      const fromRoom = this.battlesService.getBattleRoomId(payload.battleId, change.from)
      const toRoom = this.battlesService.getBattleRoomId(payload.battleId, change.to)

      void socket.leave(fromRoom)
      void socket.join(toRoom)
      socket.emit('battle:team:updated', { battleId: payload.battleId, team: change.to })
    }

    this.server.to(battleRoomId).emit('battle:all:updated', payload)
  }
}
