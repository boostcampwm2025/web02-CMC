/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing'
import { BattlesGateway } from './battles.gateway'
import { BattleInteractionUseCase } from '../../application/usecases/battleInteraction.usecase'
import { BattleParticipationUseCase } from '../../application/usecases/battleParticipation.usecase'
import { BattleCreationUseCase } from '../../application/usecases/battleCreation.usecase'
import { BattlePhaseTransitionUseCase } from '../../application/usecases/battlePhaseTransition.usecase'
import { BattleQueryUseCase } from '../../application/usecases/battleQuery.usecase'
import { BATTLE_IDENTIFIER_PORT } from '../../application/ports/tokens'
import { getBattleRoomId } from '../../domains/services/utils/battle.util'
import { AttackRequestDto, DefenseRequestDto, AttackVoteRequestDto, DefenseVoteRequestDto } from '../../dto/discussion.dto'
import { BATTLE_TEAM, BATTLE_DISCUSSION_TYPE } from '../../domains/models/const/battles.const'
import { BattleDiscussion, BattleDefense } from '../../domains/models/types/battle.types'

import { DiscussionVoteResponseDto } from '../../dto/discussionVoteResponse.dto'
import { BattleUserUpdateResponseDto } from '../../dto/battleUserUpdateResponse.dto'
import { BattleTeamUpdateAllResponseDto } from '../../dto/battleTeamUpdateAllResponse.dto'
import { MetricsService } from '../../../metrics/metrics.service'
import { BattleBroadcasterAdapter } from '../out/broadcaster/battleBroadcaster.adapter'

describe('BattlesGateway - Discussion Events', () => {
  let gateway: BattlesGateway
  let interactionUseCase: jest.Mocked<BattleInteractionUseCase>
  let mockClient: any
  let mockServer: any

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BattlesGateway,
        {
          provide: BattleInteractionUseCase,
          useValue: {
            submitDiscussion: jest.fn(),
            submitVote: jest.fn(),
            sendChat: jest.fn(),
            switchTeam: jest.fn(),
          },
        },
        {
          provide: BattleParticipationUseCase,
          useValue: {
            join: jest.fn(),
            leave: jest.fn(),
          },
        },
        {
          provide: BattleCreationUseCase,
          useValue: {
            start: jest.fn(),
          },
        },
        {
          provide: BattlePhaseTransitionUseCase,
          useValue: {
            handlePhaseSkip: jest.fn(),
          },
        },
        {
          provide: BattleQueryUseCase,
          useValue: {
            isPrivateBattle: jest.fn(),
          },
        },
        {
          provide: BATTLE_IDENTIFIER_PORT,
          useValue: {
            generateId: jest.fn(),
            generateInviteCode: jest.fn(),
          },
        },
        {
          provide: MetricsService,
          useValue: {
            startSocketTimer: jest.fn(() => jest.fn()),
            setActiveSocketConnections: jest.fn(),
          },
        },
        {
          provide: BattleBroadcasterAdapter,
          useValue: {
            setServer: jest.fn(),
            emitPhaseUpdated: jest.fn(),
            emitRoundUpdated: jest.fn(),
            emitUserUpdated: jest.fn(),
            emitTeamUpdated: jest.fn(),
            emitBattleClosed: jest.fn(),
            emitPhaseSkipped: jest.fn(),
            emitAttacked: jest.fn(),
            emitDefensed: jest.fn(),
          },
        },
      ],
    }).compile()

    gateway = module.get(BattlesGateway)
    interactionUseCase = module.get(BattleInteractionUseCase)

    mockClient = {
      id: 'client-123',
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
      data: {
        userId: 'user-1',
      },
      handshake: {
        auth: {
          userId: 'user-1',
        },
      },
    }

    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    }

    gateway.server = mockServer
  })

  describe('battle:attack', () => {
    it('공격 이벤트를 처리하고 팀 룸에 브로드캐스트한다', async () => {
      const dto: AttackRequestDto = {
        battleId: 'battle-1',
        content: '퀵소트가 더 빠릅니다',
        team: BATTLE_TEAM.A,
      }

      const mockAttack: BattleDiscussion = {
        discussionId: 'attack-1',
        author: {
          authorId: 'user-1',
          nickname: 'test-user',
        },
        type: BATTLE_DISCUSSION_TYPE.ATTACK,
        content: '퀵소트가 더 빠릅니다',
        upvotes: 0,
        votes: [],
        status: 'PENDING',
        team: BATTLE_TEAM.A,
      }

      interactionUseCase.submitDiscussion.mockResolvedValue(mockAttack)

      await gateway.handleAttack(dto, mockClient)

      expect(interactionUseCase.submitDiscussion).toHaveBeenCalledWith('battle-1', 'user-1', '퀵소트가 더 빠릅니다', BATTLE_TEAM.A, 'attack')
      expect(mockServer.to).toHaveBeenCalledWith(getBattleRoomId('battle-1', BATTLE_TEAM.A))
      expect(mockServer.emit).toHaveBeenCalledWith('battle:attack:created', mockAttack)
    })

    it('공격 등록 실패 시 에러 이벤트를 emit한다', async () => {
      const dto: AttackRequestDto = {
        battleId: 'battle-1',
        content: '내용',
        team: BATTLE_TEAM.A,
      }

      interactionUseCase.submitDiscussion.mockRejectedValue(new Error('Phase가 올바르지 않습니다'))

      await gateway.handleAttack(dto, mockClient)

      expect(mockClient.emit).toHaveBeenCalledWith('battle:attack:error', {
        message: 'Phase가 올바르지 않습니다',
      })
    })
  })

  describe('battle:defense', () => {
    it('반론 이벤트를 처리하고 팀 룸에 브로드캐스트한다', async () => {
      const dto: DefenseRequestDto = {
        battleId: 'battle-1',
        content: '하지만 최악의 경우 O(n²)입니다',
        team: BATTLE_TEAM.B,
      }

      const mockDefense: BattleDefense = {
        discussionId: 'defense-1',
        author: {
          authorId: 'user-1',
          nickname: 'test-user',
        },
        type: BATTLE_DISCUSSION_TYPE.DEFENSE,
        content: '하지만 최악의 경우 O(n²)입니다',
        upvotes: 0,
        votes: [],
        status: 'PENDING',
        team: BATTLE_TEAM.B,
      }

      interactionUseCase.submitDiscussion.mockResolvedValue(mockDefense)

      await gateway.handleDefense(dto, mockClient)

      expect(interactionUseCase.submitDiscussion).toHaveBeenCalledWith(
        'battle-1',
        'user-1',
        '하지만 최악의 경우 O(n²)입니다',
        BATTLE_TEAM.B,
        'defense',
      )
      expect(mockServer.to).toHaveBeenCalledWith(getBattleRoomId('battle-1', BATTLE_TEAM.B))
      expect(mockServer.emit).toHaveBeenCalledWith('battle:defense:created', mockDefense)
    })

    it('반론 등록 실패 시 에러 이벤트를 emit한다', async () => {
      const dto: DefenseRequestDto = {
        battleId: 'battle-1',
        content: '반론',
        team: BATTLE_TEAM.B,
      }

      interactionUseCase.submitDiscussion.mockRejectedValue(new Error('현재 반론을 등록할 수 없는 단계입니다.'))

      await gateway.handleDefense(dto, mockClient)

      expect(mockClient.emit).toHaveBeenCalledWith('battle:defense:error', {
        message: '현재 반론을 등록할 수 없는 단계입니다.',
      })
    })
  })

  describe('battle:attack:vote', () => {
    it('공격 투표 이벤트를 처리하고 팀 룸에 브로드캐스트한다', async () => {
      const dto: AttackVoteRequestDto = {
        battleId: 'battle-1',
        discussionId: 'attack-1',
        team: BATTLE_TEAM.A,
      }

      const mockResponse = DiscussionVoteResponseDto.of('battle-1', {
        discussionId: 'attack-1',
        author: {
          authorId: 'user-1',
          nickname: 'test-user',
        },
        type: BATTLE_DISCUSSION_TYPE.ATTACK,
        content: '퀵소트가 더 빠릅니다',
        upvotes: 1,
        votes: ['user-1'],
        status: 'PENDING',
        team: BATTLE_TEAM.A,
      })

      interactionUseCase.submitVote.mockResolvedValue([mockResponse])

      await gateway.handleAttackVote(dto, mockClient)

      expect(interactionUseCase.submitVote).toHaveBeenCalledWith('battle-1', 'attack-1', 'user-1', BATTLE_TEAM.A, 'attack')

      expect(mockServer.emit).toHaveBeenCalledWith('battle:attack:voted', mockResponse)
    })
  })

  describe('battle:defense:vote', () => {
    it('반론 투표 이벤트를 처리하고 팀 룸에 브로드캐스트한다', async () => {
      const dto: DefenseVoteRequestDto = {
        battleId: 'battle-1',
        discussionId: 'defense-1',
        team: BATTLE_TEAM.B,
      }

      const mockResponse = DiscussionVoteResponseDto.of('battle-1', {
        discussionId: 'defense-1',
        author: {
          authorId: 'user-2',
          nickname: 'test-user-2',
        },
        type: BATTLE_DISCUSSION_TYPE.DEFENSE,
        content: '반론',
        upvotes: 1,
        votes: ['user-1'],
        status: 'PENDING',
        team: BATTLE_TEAM.B,
      })

      interactionUseCase.submitVote.mockResolvedValue([mockResponse])

      await gateway.handleDefenseVote(dto, mockClient)

      expect(interactionUseCase.submitVote).toHaveBeenCalledWith('battle-1', 'defense-1', 'user-1', BATTLE_TEAM.B, 'defense')

      expect(mockServer.emit).toHaveBeenCalledWith('battle:defense:voted', mockResponse)
    })
  })

  describe('battle:user:updated', () => {
    it('사용자 업데이트 이벤트를 배틀 룸에 브로드캐스트한다', () => {
      const payload = BattleUserUpdateResponseDto.of('battle-1', {
        teamA: 5,
        teamB: 3,
        teamNone: 2,
      })

      gateway.userUpdate(payload)

      expect(mockServer.to).toHaveBeenCalledWith(getBattleRoomId('battle-1'))
      expect(mockServer.emit).toHaveBeenCalledWith('battle:user:updated', payload)
    })
  })

  describe('battle:all:updated', () => {
    it('팀 변경 이벤트를 배틀 룸에 브로드캐스트한다', () => {
      const mockSocket1 = {
        id: 'socket-1',
        leave: jest.fn(),
        join: jest.fn(),
        emit: jest.fn(),
      }
      const mockSocket2 = {
        id: 'socket-2',
        leave: jest.fn(),
        join: jest.fn(),
        emit: jest.fn(),
      }

      gateway['userIdToSocketMap'].set('user-1', mockSocket1 as any)
      gateway['userIdToSocketMap'].set('user-2', mockSocket2 as any)

      const payload = BattleTeamUpdateAllResponseDto.of('battle-1', 1, { teamA: 5, teamB: 3, teamNone: 2 }, { teamA: 4, teamB: 4, teamNone: 2 }, [
        { userId: 'user-1', from: BATTLE_TEAM.A, to: BATTLE_TEAM.B },
        { userId: 'user-2', from: BATTLE_TEAM.B, to: BATTLE_TEAM.A },
      ])

      gateway.teamUpdate(payload)

      expect(mockSocket1.leave).toHaveBeenCalledWith('battle:battle-1:room:A')
      expect(mockSocket1.join).toHaveBeenCalledWith('battle:battle-1:room:B')
      expect(mockSocket1.emit).toHaveBeenCalledWith('battle:team:updated', {
        battleId: 'battle-1',
        team: BATTLE_TEAM.B,
      })

      expect(mockSocket2.leave).toHaveBeenCalledWith('battle:battle-1:room:B')
      expect(mockSocket2.join).toHaveBeenCalledWith('battle:battle-1:room:A')
      expect(mockSocket2.emit).toHaveBeenCalledWith('battle:team:updated', {
        battleId: 'battle-1',
        team: BATTLE_TEAM.A,
      })

      expect(mockServer.to).toHaveBeenCalledWith('battle:battle-1:room:all')
      expect(mockServer.emit).toHaveBeenCalledWith('battle:all:updated', payload)
    })
  })

  describe('handleConnection', () => {
    it('소켓 연결 시 userId를 저장한다', () => {
      const mockClientNew = {
        id: 'client-new',
        emit: jest.fn(),
        data: {} as { userId?: string },
        handshake: {
          auth: {
            userId: 'new-user',
          },
        },
        disconnect: jest.fn(),
      }

      gateway.handleConnection(mockClientNew as any)

      expect(mockClientNew.data.userId).toBe('new-user')
    })

    it('userId가 없으면 연결을 끊는다', () => {
      const mockClientNoAuth = {
        id: 'client-no-auth',
        emit: jest.fn(),
        data: {},
        handshake: {
          auth: {},
        },
        disconnect: jest.fn(),
      }

      gateway.handleConnection(mockClientNoAuth as any)

      expect(mockClientNoAuth.disconnect).toHaveBeenCalled()
    })
  })

  describe('handleDisconnect', () => {
    let participationUseCase: jest.Mocked<BattleParticipationUseCase>

    beforeEach(() => {
      participationUseCase = gateway['participationUseCase'] as jest.Mocked<BattleParticipationUseCase>
    })

    it('배틀에 참여 중이면 leave를 호출한다', async () => {
      const mockClientWithBattle = {
        id: 'client-with-battle',
        emit: jest.fn(),
        data: {
          userId: 'user-in-battle',
          battleId: 'battle-1',
        },
        disconnect: jest.fn(),
      }

      participationUseCase.leave.mockResolvedValue({} as any)
      gateway['userIdToSocketMap'].set('user-in-battle', mockClientWithBattle as any)

      await gateway.handleDisconnect(mockClientWithBattle as any)

      expect(participationUseCase.leave).toHaveBeenCalledWith('user-in-battle', 'battle-1')
      expect(mockClientWithBattle.disconnect).toHaveBeenCalled()
    })

    it('userId만 있고 battleId가 없으면 leave를 호출하지 않는다', async () => {
      const mockClientNoBattle = {
        id: 'client-no-battle',
        emit: jest.fn(),
        data: {
          userId: 'user-no-battle',
        },
        disconnect: jest.fn(),
      }

      gateway['userIdToSocketMap'].set('user-no-battle', mockClientNoBattle as any)

      await gateway.handleDisconnect(mockClientNoBattle as any)

      expect(participationUseCase.leave).not.toHaveBeenCalled()
      expect(mockClientNoBattle.disconnect).toHaveBeenCalled()
    })
  })

  describe('joinBattle', () => {
    let participationUseCase: jest.Mocked<BattleParticipationUseCase>
    let queryUseCase: jest.Mocked<BattleQueryUseCase>

    beforeEach(() => {
      participationUseCase = gateway['participationUseCase'] as jest.Mocked<BattleParticipationUseCase>
      queryUseCase = gateway['queryUseCase'] as jest.Mocked<BattleQueryUseCase>
    })

    it('공개 배틀에 참가한다', async () => {
      const dto = {
        battleId: 'battle-1',
        team: BATTLE_TEAM.A,
        nickname: '테스터',
      }

      queryUseCase.isPrivateBattle.mockResolvedValue(false)
      participationUseCase.join.mockResolvedValue({
        battleState: {
          battleId: 'battle-1',
          round: 1,
          phase: 'PENDING',
          phaseCount: 1,
          startedAt: null,
          expiredAt: null,
          topics: ['topic1'],
          totalRounds: 1,
          participants: new Map([['user-1', BATTLE_TEAM.A]]),
          userInfoMap: new Map([['user-1', '테스터']]),
          teamVotes: new Map(),
          skipState: new Set(),
          teamA: { roomId: 'battle:battle-1:room:A', users: ['user-1'], chats: [], attacks: [], defenses: [] },
          teamB: { roomId: 'battle:battle-1:room:B', users: [], chats: [], attacks: [], defenses: [] },
          all: { roomId: 'battle:battle-1:room:all', chats: [], attacks: [], defenses: [] },
          opinionHistory: [],
        } as any,
        team: BATTLE_TEAM.A,
      })

      const joinMockClient = {
        ...mockClient,
        join: jest.fn().mockResolvedValue(undefined),
      }

      await gateway.joinBattle(dto as any, joinMockClient)

      expect(queryUseCase.isPrivateBattle).toHaveBeenCalledWith('battle-1')
      expect(participationUseCase.join).toHaveBeenCalled()
      expect(joinMockClient.emit).toHaveBeenCalledWith('battle:joined', expect.any(Object))
    })

    it('비공개 배틀에 초대 코드 없이 접근하면 에러를 emit한다', async () => {
      const dto = {
        battleId: 'battle-private',
        team: BATTLE_TEAM.A,
        nickname: '테스터',
      }

      queryUseCase.isPrivateBattle.mockResolvedValue(true)

      const joinMockClient = {
        ...mockClient,
        handshake: {
          auth: { userId: 'user-1' },
          headers: { cookie: '' },
        },
        join: jest.fn().mockResolvedValue(undefined),
      }

      await gateway.joinBattle(dto as any, joinMockClient)

      expect(joinMockClient.emit).toHaveBeenCalledWith('battle:join:error', {
        message: '비공개 배틀에 접근하려면 초대 코드가 필요합니다.',
      })
    })
  })

  describe('handleLeave', () => {
    let participationUseCase: jest.Mocked<BattleParticipationUseCase>

    beforeEach(() => {
      participationUseCase = gateway['participationUseCase'] as jest.Mocked<BattleParticipationUseCase>
    })

    it('배틀에서 나간다', async () => {
      const dto = { battleId: 'battle-1' }
      participationUseCase.leave.mockResolvedValue({} as any)

      await gateway.handleLeave(dto, mockClient)

      expect(participationUseCase.leave).toHaveBeenCalledWith('user-1', 'battle-1')
      expect(mockServer.to).toHaveBeenCalledWith('battle:battle-1:room:all')
      expect(mockServer.emit).toHaveBeenCalledWith('battle:leaved', expect.any(Object))
    })
  })

  describe('handleStart', () => {
    let creationUseCase: jest.Mocked<BattleCreationUseCase>

    beforeEach(() => {
      creationUseCase = gateway['creationUseCase'] as jest.Mocked<BattleCreationUseCase>
    })

    it('배틀을 시작한다', async () => {
      const dto = { battleId: 'battle-1' }
      creationUseCase.start.mockResolvedValue(undefined)

      await gateway.handleStart(dto as any)

      expect(creationUseCase.start).toHaveBeenCalledWith('battle-1')
      expect(mockServer.to).toHaveBeenCalledWith('battle:battle-1:room:all')
      expect(mockServer.emit).toHaveBeenCalledWith('battle:started')
    })
  })

  describe('handlePhaseSkip', () => {
    let phaseTransitionUseCase: jest.Mocked<BattlePhaseTransitionUseCase>

    beforeEach(() => {
      phaseTransitionUseCase = gateway['phaseTransitionUseCase'] as jest.Mocked<BattlePhaseTransitionUseCase>
    })

    it('스킵 요청을 처리한다', async () => {
      const dto = { skip: true, battleId: 'battle-1' }
      phaseTransitionUseCase.handlePhaseSkip.mockResolvedValue(3)

      await gateway.handlePhaseSkip(dto, mockClient)

      expect(phaseTransitionUseCase.handlePhaseSkip).toHaveBeenCalledWith('battle-1', 'user-1', true)
      expect(mockServer.to).toHaveBeenCalledWith('battle:battle-1:room:all')
      expect(mockServer.emit).toHaveBeenCalledWith('battle:user:skipped', { totalSkips: 3 })
    })
  })

  describe('handleChat', () => {
    it('채팅을 전송한다', async () => {
      const dto = {
        battleId: 'battle-1',
        scope: 'all',
        team: BATTLE_TEAM.A,
        text: '안녕하세요',
      }

      interactionUseCase.sendChat.mockResolvedValue({
        battleId: 'battle-1',
        scope: 'all',
        messageId: 'msg-1',
        team: BATTLE_TEAM.A,
        sender: { userId: 'user-1', nickname: '테스터' },
        text: '안녕하세요',
        createdAt: new Date(),
      })

      const chatMockServer = {
        to: jest.fn().mockReturnValue({
          except: jest.fn().mockReturnValue({
            emit: jest.fn(),
          }),
        }),
        emit: jest.fn(),
      }
      gateway.server = chatMockServer as any

      await gateway.handleChat(dto as any, mockClient)

      expect(interactionUseCase.sendChat).toHaveBeenCalled()
    })
  })

  describe('handleTeamVote', () => {
    it('팀 투표를 처리한다', async () => {
      const dto = {
        battleId: 'battle-1',
        team: BATTLE_TEAM.B,
      }

      interactionUseCase.switchTeam.mockResolvedValue(undefined)

      await gateway.handleTeamVote(dto as any, mockClient)

      expect(interactionUseCase.switchTeam).toHaveBeenCalledWith('battle-1', 'user-1', BATTLE_TEAM.B)
    })
  })

  describe('phaseUpdate', () => {
    it('페이즈 업데이트를 브로드캐스트한다', () => {
      const payload = { battleId: 'battle-1', phase: 'ATTACK', phaseCount: 1, startedAt: Date.now(), expiredAt: Date.now() + 60000 }

      gateway.phaseUpdate(payload as any)

      expect(mockServer.to).toHaveBeenCalledWith('battle:battle-1:room:all')
      expect(mockServer.emit).toHaveBeenCalledWith('battle:phase:updated', payload)
    })
  })

  describe('roundUpdate', () => {
    it('라운드 업데이트를 브로드캐스트한다', () => {
      const payload = { battleId: 'battle-1', round: 2, topic: 'topic2' }

      gateway.roundUpdate(payload as any)

      expect(mockServer.to).toHaveBeenCalledWith('battle:battle-1:room:all')
      expect(mockServer.emit).toHaveBeenCalledWith('battle:round:updated', payload)
    })
  })

  describe('onAttacked', () => {
    it('공격 결과를 브로드캐스트한다', () => {
      const payload = { battleId: 'battle-1', aTeam: null, bTeam: null }

      gateway.onAttacked(payload as any)

      expect(mockServer.to).toHaveBeenCalledWith('battle:battle-1:room:all')
      expect(mockServer.emit).toHaveBeenCalledWith('battle:attacked', payload)
    })
  })

  describe('onDefensed', () => {
    it('반론 결과를 브로드캐스트한다', () => {
      const payload = { battleId: 'battle-1', aTeam: null, bTeam: null }

      gateway.onDefensed(payload as any)

      expect(mockServer.to).toHaveBeenCalledWith('battle:battle-1:room:all')
      expect(mockServer.emit).toHaveBeenCalledWith('battle:defensed', payload)
    })
  })

  describe('closeBattle', () => {
    it('배틀 종료를 브로드캐스트하고 소켓을 끊는다', () => {
      const payload = { battleId: 'battle-1' }
      const mockIn = jest.fn().mockReturnValue({ disconnectSockets: jest.fn() })
      gateway.server = { ...mockServer, in: mockIn }

      gateway.closeBattle(payload as any)

      expect(mockServer.to).toHaveBeenCalledWith('battle:battle-1:room:all')
      expect(mockServer.emit).toHaveBeenCalledWith('battle:closed', payload)
      expect(mockIn).toHaveBeenCalledTimes(3)
    })
  })

  describe('skipPhase', () => {
    it('스킵 이벤트를 브로드캐스트한다', () => {
      const payload = { battleId: 'battle-1' }

      gateway.skipPhase(payload)

      expect(mockServer.to).toHaveBeenCalledWith('battle:battle-1:room:all')
      expect(mockServer.emit).toHaveBeenCalledWith('battle:phase:skipped')
    })
  })

  describe('afterInit', () => {
    it('broadcaster에 서버를 설정한다', () => {
      const broadcasterAdapter = gateway['broadcaster'] as jest.Mocked<BattleBroadcasterAdapter>

      gateway.afterInit(mockServer)

      expect(broadcasterAdapter.setServer).toHaveBeenCalledWith(mockServer)
    })
  })
})
