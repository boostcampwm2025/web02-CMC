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
import { IsPrivateBattleUseCase } from '../../application/usecases/isPrivateBattle.usecase'
import { BATTLE_UTIL_PORT } from '../../application/ports/tokens'
import type { BattleUtilPort } from '../../application/ports/out/battleUtil.port'
import { AttackRequestDto, DefenseRequestDto, AttackVoteRequestDto, DefenseVoteRequestDto } from '../../dto/discussion.dto'
import { BATTLE_TEAM, BATTLE_DISCUSSION_TYPE } from '../../domains/models/const/battles.const'
import { BattleDiscussion, BattleDefense } from '../../domains/models/types/battle.types'

import { DiscussionVoteResponseDto } from '../../dto/discussionVoteResponse.dto'
import { BattleUserUpdateResponseDto } from '../../dto/battleUserUpdateResponse.dto'
import { BattleTeamUpdateAllResponseDto } from '../../dto/battleTeamUpdateAllResponse.dto'
import { MetricsService } from '../../../metrics/metrics.service'

describe('BattlesGateway - Discussion Events', () => {
  let gateway: BattlesGateway
  let interactionUseCase: jest.Mocked<BattleInteractionUseCase>
  let utilPort: jest.Mocked<BattleUtilPort>
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
          provide: IsPrivateBattleUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: BATTLE_UTIL_PORT,
          useValue: {
            getBattleRoomId: jest.fn(),
          },
        },
        {
          provide: MetricsService,
          useValue: {
            startSocketTimer: jest.fn(() => jest.fn()),
            setActiveSocketConnections: jest.fn(),
          },
        },
      ],
    }).compile()

    gateway = module.get(BattlesGateway)
    interactionUseCase = module.get(BattleInteractionUseCase)
    utilPort = module.get(BATTLE_UTIL_PORT)

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
      utilPort.getBattleRoomId.mockReturnValue('battle-1:A')

      await gateway.handleAttack(dto, mockClient)

      expect(interactionUseCase.submitDiscussion).toHaveBeenCalledWith('battle-1', 'user-1', '퀵소트가 더 빠릅니다', BATTLE_TEAM.A, 'attack')
      expect(utilPort.getBattleRoomId).toHaveBeenCalledWith('battle-1', BATTLE_TEAM.A)
      expect(mockServer.to).toHaveBeenCalledWith('battle-1:A')
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
      utilPort.getBattleRoomId.mockReturnValue('battle-1:B')

      await gateway.handleDefense(dto, mockClient)

      expect(interactionUseCase.submitDiscussion).toHaveBeenCalledWith(
        'battle-1',
        'user-1',
        '하지만 최악의 경우 O(n²)입니다',
        BATTLE_TEAM.B,
        'defense',
      )
      expect(utilPort.getBattleRoomId).toHaveBeenCalledWith('battle-1', BATTLE_TEAM.B)
      expect(mockServer.to).toHaveBeenCalledWith('battle-1:B')
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
      utilPort.getBattleRoomId.mockReturnValue('battle-1:A')

      await gateway.handleAttackVote(dto, mockClient)

      expect(interactionUseCase.submitVote).toHaveBeenCalledWith('battle-1', 'attack-1', 'user-1', BATTLE_TEAM.A, 'attack')

      expect(mockServer.to).toHaveBeenCalledWith('battle-1:A')
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
      utilPort.getBattleRoomId.mockReturnValue('battle-1:B')

      await gateway.handleDefenseVote(dto, mockClient)

      expect(interactionUseCase.submitVote).toHaveBeenCalledWith('battle-1', 'defense-1', 'user-1', BATTLE_TEAM.B, 'defense')

      expect(mockServer.to).toHaveBeenCalledWith('battle-1:B')
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

      utilPort.getBattleRoomId.mockReturnValue('battle:battle-1')

      gateway.userUpdate(payload)

      expect(utilPort.getBattleRoomId).toHaveBeenCalledWith('battle-1')
      expect(mockServer.to).toHaveBeenCalledWith('battle:battle-1')
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

      utilPort.getBattleRoomId.mockImplementation((battleId: string, team?: string) => {
        if (!team) return `battle:${battleId}`
        return `battle:${battleId}:${team}`
      })

      gateway.teamUpdate(payload)

      expect(mockSocket1.leave).toHaveBeenCalledWith('battle:battle-1:A')
      expect(mockSocket1.join).toHaveBeenCalledWith('battle:battle-1:B')
      expect(mockSocket1.emit).toHaveBeenCalledWith('battle:team:updated', {
        battleId: 'battle-1',
        team: BATTLE_TEAM.B,
      })

      expect(mockSocket2.leave).toHaveBeenCalledWith('battle:battle-1:B')
      expect(mockSocket2.join).toHaveBeenCalledWith('battle:battle-1:A')
      expect(mockSocket2.emit).toHaveBeenCalledWith('battle:team:updated', {
        battleId: 'battle-1',
        team: BATTLE_TEAM.A,
      })

      expect(mockServer.to).toHaveBeenCalledWith('battle:battle-1')
      expect(mockServer.emit).toHaveBeenCalledWith('battle:all:updated', payload)
    })
  })
})
