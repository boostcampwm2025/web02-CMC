import { Logger, UnauthorizedException, NotFoundException, ForbiddenException, Inject } from '@nestjs/common'
import { Server } from 'socket.io'
import type { SocketWithUserId } from '../../domains/models/types/socket.types'
import type { BattleTeam } from '../../domains/models/types/battle.types'
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { BattleJoinRequestDto } from '../../dto/battleJoinRequest.dto'
import { BattleJoinResponseDto } from '../../dto/battleJoinResponse.dto'
import { AttackRequestDto, DefenseRequestDto, AttackVoteRequestDto, DefenseVoteRequestDto } from '../../dto/discussion.dto'
import { BattlePhaseResponseDto, BattleRoundResponseDto } from '../../dto/battleTurnResponse.dto'
import { BattleChatDto } from '../../dto/battleChat.dto'
import { BATTLE_CHAT_SCOPE } from '../../domains/models/const/battles.const'
import { DiscussionVoteResultDto } from '../../dto/discussionVoteResult.dto'
import { BattleTeamVoteDto } from '../../dto/battleTeamVote.dto'
import { BattleClosedResponseDto } from '../../dto/battleClosedResponse.dto'
import { BattleTeamUpdateAllResponseDto } from '../../dto/battleTeamUpdateAllResponse.dto'
import { BattleUserUpdateResponseDto } from '../../dto/battleUserUpdateResponse.dto'
import { BattleStartDto } from '../../dto/battleStart.dto'
import { MetricsService } from '../../../metrics/metrics.service'
import { BattleParticipationUseCase } from '../../application/usecases/battleParticipation.usecase'
import { BattleCreationUseCase } from '../../application/usecases/battleCreation.usecase'
import { BattleInteractionUseCase } from '../../application/usecases/battleInteraction.usecase'
import { BattlePhaseTransitionUseCase } from '../../application/usecases/battlePhaseTransition.usecase'
import { IsPrivateBattleUseCase } from '../../application/usecases/isPrivateBattle.usecase'
import { BATTLE_UTIL_PORT } from '../../application/ports/tokens'
import type { BattleUtilPort } from '../../application/ports/out/battleUtil.port'
import { BattleBroadcasterAdapter } from '../out/broadcaster/battleBroadcaster.adapter'

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class BattlesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(BattlesGateway.name)
  private readonly userIdToSocketMap = new Map<string, SocketWithUserId>()

  constructor(
    private readonly participationUseCase: BattleParticipationUseCase,
    private readonly creationUseCase: BattleCreationUseCase,
    private readonly interactionUseCase: BattleInteractionUseCase,
    private readonly phaseTransitionUseCase: BattlePhaseTransitionUseCase,
    private readonly isPrivateBattleUseCase: IsPrivateBattleUseCase,
    @Inject(BATTLE_UTIL_PORT) private readonly utilPort: BattleUtilPort,
    private readonly metricsService: MetricsService,
    private readonly broadcaster: BattleBroadcasterAdapter,
  ) {}

  afterInit(server: Server) {
    this.broadcaster.setServer(server)
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
        const result = await this.participationUseCase.leave(userId, battleId)
        const battleRoomId = this.utilPort.getBattleRoomId(battleId)
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
      const isPrivate = await this.isPrivateBattleUseCase.execute(battleId)
      if (isPrivate) {
        const cookieHeader = client.handshake.headers.cookie
        const cookieName = `inviteAccess_${battleId}`
        if (!cookieHeader?.includes(cookieName)) {
          throw new ForbiddenException('비공개 배틀에 접근하려면 초대 코드가 필요합니다.')
        }
      }

      const { battleState, team } = await this.participationUseCase.join(battleJoinRequestDto, userId)

      const res = BattleJoinResponseDto.of(battleState, team)
      const battleRoomId = this.utilPort.getBattleRoomId(battleId)
      const battleTeamRoom = this.utilPort.getBattleRoomId(battleId, team)

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
    const battleRoomId = this.utilPort.getBattleRoomId(battleId)

    const result = await this.participationUseCase.leave(userId, battleId)
    client.data.battleId = undefined

    this.server.to(battleRoomId).emit('battle:leaved', result)
  }

  @SubscribeMessage('battle:start')
  async handleStart(@MessageBody() dto: BattleStartDto) {
    const stopTimer = this.metricsService.startSocketTimer('battle:start')
    try {
      const { battleId } = dto
      await this.creationUseCase.start(battleId)

      const battleRoomId = this.utilPort.getBattleRoomId(battleId)

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
      const battleId: string = dto.battleId
      const content: string = dto.content
      const team: BattleTeam = dto.team
      const attack = await this.interactionUseCase.submitDiscussion(battleId, userId, content, team, 'attack')
      const teamRoom = this.utilPort.getBattleRoomId(battleId, team)

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
      const battleId: string = dto.battleId
      const content: string = dto.content
      const team: BattleTeam = dto.team
      const defense = await this.interactionUseCase.submitDiscussion(battleId, userId, content, team, 'defense')
      const teamRoom = this.utilPort.getBattleRoomId(battleId, team)

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
      const battleId: string = dto.battleId
      const discussionId: string = dto.discussionId
      const team: BattleTeam = dto.team
      const updates = await this.interactionUseCase.submitVote(battleId, discussionId, userId, team, 'attack')
      const teamRoom = this.utilPort.getBattleRoomId(battleId, team)

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
      const battleId: string = dto.battleId
      const discussionId: string = dto.discussionId
      const team: BattleTeam = dto.team
      const updates = await this.interactionUseCase.submitVote(battleId, discussionId, userId, team, 'defense')
      const teamRoom = this.utilPort.getBattleRoomId(battleId, team)

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
      const totalSkips = await this.phaseTransitionUseCase.handlePhaseSkip(battleId, userId, skip)
      const battleRoomId = this.utilPort.getBattleRoomId(battleId)

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
    const battleRoomId = this.utilPort.getBattleRoomId(battleId)

    this.server.to(battleRoomId).emit('battle:phase:updated', payload)
  }

  roundUpdate(payload: BattleRoundResponseDto) {
    const { battleId } = payload
    const battleRoomId = this.utilPort.getBattleRoomId(battleId)

    this.server.to(battleRoomId).emit('battle:round:updated', payload)
  }

  onAttacked(payload: DiscussionVoteResultDto) {
    const { battleId } = payload
    const battleRoomId = this.utilPort.getBattleRoomId(battleId)

    this.server.to(battleRoomId).emit('battle:attacked', payload)
  }

  onDefensed(payload: DiscussionVoteResultDto) {
    const { battleId } = payload
    const battleRoomId = this.utilPort.getBattleRoomId(battleId)

    this.server.to(battleRoomId).emit('battle:defensed', payload)
  }

  closeBattle(payload: BattleClosedResponseDto) {
    const { battleId } = payload
    const battleRoomId = this.utilPort.getBattleRoomId(battleId)
    const battleARoomId = this.utilPort.getBattleRoomId(battleId, 'A')
    const battleBRoomId = this.utilPort.getBattleRoomId(battleId, 'B')

    this.server.to(battleRoomId).emit('battle:closed', payload)

    const rooms = [battleRoomId, battleARoomId, battleBRoomId]

    rooms.forEach(room => this.server.in(room).disconnectSockets(true))
  }

  userUpdate(payload: BattleUserUpdateResponseDto) {
    const { battleId } = payload
    const battleRoomId = this.utilPort.getBattleRoomId(battleId)

    this.server.to(battleRoomId).emit('battle:user:updated', payload)
  }

  skipPhase(payload: { battleId: string }) {
    const { battleId } = payload
    const battleRoomId = this.utilPort.getBattleRoomId(battleId)

    this.server.to(battleRoomId).emit('battle:phase:skipped')
  }

  @SubscribeMessage('battle:chat')
  async handleChat(@MessageBody() battleChatDto: BattleChatDto, @ConnectedSocket() client: SocketWithUserId) {
    const stopTimer = this.metricsService.startSocketTimer('battle:chat')
    try {
      const userId = this.getUserIdFromSocket(client)

      const saved = await this.interactionUseCase.sendChat(battleChatDto, userId)
      const battleId: string = battleChatDto.battleId
      const scope: typeof BATTLE_CHAT_SCOPE.ALL | typeof BATTLE_CHAT_SCOPE.TEAM = battleChatDto.scope
      const team: BattleTeam = battleChatDto.team
      const roomId = scope === BATTLE_CHAT_SCOPE.ALL ? this.utilPort.getBattleRoomId(battleId) : this.utilPort.getBattleRoomId(battleId, team)

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
      const battleId: string = dto.battleId
      const team: BattleTeam = dto.team

      await this.interactionUseCase.switchTeam(battleId, userId, team)
      stopTimer('success')
    } catch (error) {
      stopTimer('error')
      if (error instanceof Error) {
        client.emit('battle:team:vote:error', { message: error.message })
      }
    }
  }

  teamUpdate(payload: BattleTeamUpdateAllResponseDto) {
    const battleRoomId = this.utilPort.getBattleRoomId(payload.battleId)

    // 각 클라이언트의 소켓 룸 이동 및 개별 알림
    for (const change of payload.changes) {
      const socket = this.userIdToSocketMap.get(change.userId)
      if (!socket) continue

      const battleId: string = payload.battleId
      const fromTeam: BattleTeam = change.from
      const toTeam: BattleTeam = change.to
      const fromRoom = this.utilPort.getBattleRoomId(battleId, fromTeam)
      const toRoom = this.utilPort.getBattleRoomId(battleId, toTeam)

      void socket.leave(fromRoom)
      void socket.join(toRoom)
      socket.emit('battle:team:updated', { battleId, team: toTeam })
    }

    this.server.to(battleRoomId).emit('battle:all:updated', payload)
  }
}
