/* eslint-disable @typescript-eslint/unbound-method */
import { BadRequestException, ForbiddenException } from '@nestjs/common'
import { BattleInteractionUseCase } from './battleInteraction.usecase'
import { BATTLE_TEAM } from '../../domains/models/const/battles.const'
import type { BattleStatePort } from '../ports/out/battleState.port'
import type { BattleRepoPort } from '../ports/out/battleRepository.port'
import type { BattleIdentifierPort } from '../ports/out/battleIdentifier.port'
import type { BattleVoteService } from '../../domains/services/battleVote/battleVote.service'
import type { BattleDiscussionService } from '../../domains/services/battleDiscussion/battleDiscussion.service'
import type { BattleChatService } from '../../domains/services/battleChat/battleChat.service'
import type { BattleTeamSwitchService } from '../../domains/services/battleTeamSwitch/battleTeamSwitch.service'
import type { ActiveBattleState, BattleDiscussion } from '../../domains/models/types/battle.types'
import type { BattleChatDto } from '../../dto/battleChat.dto'

describe('BattleInteractionUseCase', () => {
  let useCase: BattleInteractionUseCase
  let stateRepo: jest.Mocked<BattleStatePort>
  let repo: jest.Mocked<BattleRepoPort>
  let identifierPort: jest.Mocked<BattleIdentifierPort>
  let voteService: jest.Mocked<BattleVoteService>
  let discussionService: jest.Mocked<BattleDiscussionService>
  let chatService: jest.Mocked<BattleChatService>
  let teamSwitchService: jest.Mocked<BattleTeamSwitchService>

  const createMockState = (): ActiveBattleState =>
    ({
      battleId: 'battle-1',
      participants: new Map([['user-1', 'A']]),
      userInfoMap: new Map([['user-1', '테스터']]),
      teamA: { users: ['user-1'], attacks: [], defenses: [], chats: [] },
      teamB: { users: [], attacks: [], defenses: [], chats: [] },
      all: { attacks: [], defenses: [], chats: [] },
    }) as unknown as ActiveBattleState

  const createMockDiscussion = (): BattleDiscussion =>
    ({
      discussionId: 'discussion-1',
      author: { authorId: 'user-1', nickname: '테스터' },
      type: 'ATTACK',
      content: '의견 내용',
      upvotes: 0,
      votes: [],
      status: 'PENDING',
      team: BATTLE_TEAM.A,
    }) as BattleDiscussion

  beforeEach(() => {
    stateRepo = {
      loadBattleState: jest.fn(),
      saveBattleState: jest.fn().mockResolvedValue(undefined),
      getNicknameByUserId: jest.fn().mockReturnValue('테스터'),
    } as unknown as jest.Mocked<BattleStatePort>

    repo = {
      findUniqueUser: jest.fn().mockResolvedValue({ tier: 'GOLD' }),
    } as unknown as jest.Mocked<BattleRepoPort>

    identifierPort = {
      generateId: jest.fn().mockReturnValue('new-id-123'),
    } as unknown as jest.Mocked<BattleIdentifierPort>

    voteService = {
      applyAttackVote: jest.fn().mockReturnValue([]),
      applyDefenseVote: jest.fn().mockReturnValue([]),
    } as unknown as jest.Mocked<BattleVoteService>

    discussionService = {
      applyAttack: jest.fn().mockReturnValue(createMockDiscussion()),
      applyDefense: jest.fn().mockReturnValue(createMockDiscussion()),
      canUserSubmitAttack: jest.fn().mockReturnValue(true),
      canUserSubmitDefense: jest.fn().mockReturnValue(true),
      canUserVoteAttack: jest.fn().mockReturnValue(true),
      canUserVoteDefense: jest.fn().mockReturnValue(true),
    } as unknown as jest.Mocked<BattleDiscussionService>

    chatService = {
      buildChatMessage: jest.fn().mockReturnValue({
        messageId: 'msg-1',
        team: BATTLE_TEAM.A,
        sender: { userId: 'user-1', nickname: '테스터', tier: 'GOLD' },
        text: '안녕하세요',
        createdAt: new Date(),
      }),
      applyChatMessage: jest.fn(),
    } as unknown as jest.Mocked<BattleChatService>

    teamSwitchService = {
      applyTeamVote: jest.fn(),
    } as unknown as jest.Mocked<BattleTeamSwitchService>

    useCase = new BattleInteractionUseCase(stateRepo, repo, identifierPort, voteService, discussionService, chatService, teamSwitchService)
  })

  describe('submitDiscussion', () => {
    it('공격 의견을 제출한다', async () => {
      const mockState = createMockState()
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      const result = await useCase.submitDiscussion('battle-1', 'user-1', '의견 내용', BATTLE_TEAM.A, 'attack')

      expect(discussionService.applyAttack).toHaveBeenCalled()
      expect(stateRepo.saveBattleState).toHaveBeenCalledWith('battle-1', mockState)
      expect(result.type).toBe('ATTACK')
    })

    it('반론 의견을 제출한다', async () => {
      const mockState = createMockState()
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      const defense = { ...createMockDiscussion(), type: 'DEFENSE' }
      discussionService.applyDefense.mockReturnValue(defense as BattleDiscussion)

      const result = await useCase.submitDiscussion('battle-1', 'user-1', '반론 내용', BATTLE_TEAM.A, 'defense')

      expect(discussionService.applyDefense).toHaveBeenCalled()
      expect(stateRepo.saveBattleState).toHaveBeenCalled()
      expect(result.type).toBe('DEFENSE')
    })
  })

  describe('submitVote', () => {
    it('공격에 투표한다', async () => {
      const mockState = createMockState()
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      await useCase.submitVote('battle-1', 'discussion-1', 'user-1', BATTLE_TEAM.A, 'attack')

      expect(voteService.applyAttackVote).toHaveBeenCalled()
      expect(stateRepo.saveBattleState).toHaveBeenCalled()
    })

    it('반론에 투표한다', async () => {
      const mockState = createMockState()
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      await useCase.submitVote('battle-1', 'discussion-1', 'user-1', BATTLE_TEAM.A, 'defense')

      expect(voteService.applyDefenseVote).toHaveBeenCalled()
      expect(stateRepo.saveBattleState).toHaveBeenCalled()
    })

    it('NONE 팀은 ForbiddenException을 던진다', async () => {
      await expect(useCase.submitVote('battle-1', 'discussion-1', 'user-1', BATTLE_TEAM.NONE, 'attack')).rejects.toThrow(ForbiddenException)
      await expect(useCase.submitVote('battle-1', 'discussion-1', 'user-1', BATTLE_TEAM.NONE, 'attack')).rejects.toThrow(
        '중립 진영은 투표할 수 없습니다.',
      )
    })
  })

  describe('sendChat', () => {
    it('채팅을 전송한다', async () => {
      const mockState = createMockState()
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      const dto: BattleChatDto = {
        battleId: 'battle-1',
        scope: 'all',
        team: BATTLE_TEAM.A,
        text: '안녕하세요',
      } as BattleChatDto

      const result = await useCase.sendChat(dto, 'user-1')

      expect(chatService.buildChatMessage).toHaveBeenCalled()
      expect(chatService.applyChatMessage).toHaveBeenCalled()
      expect(stateRepo.saveBattleState).toHaveBeenCalled()
      expect(result.battleId).toBe('battle-1')
      expect(result.scope).toBe('all')
    })

    it('battleId가 없으면 BadRequestException을 던진다', async () => {
      const dto: BattleChatDto = {
        battleId: '',
        scope: 'all',
        team: BATTLE_TEAM.A,
        text: '안녕하세요',
      } as BattleChatDto

      await expect(useCase.sendChat(dto, 'user-1')).rejects.toThrow(BadRequestException)
      await expect(useCase.sendChat(dto, 'user-1')).rejects.toThrow('잘못된 요청입니다.')
    })

    it('빈 메시지는 BadRequestException을 던진다', async () => {
      const dto: BattleChatDto = {
        battleId: 'battle-1',
        scope: 'all',
        team: BATTLE_TEAM.A,
        text: '   ',
      } as BattleChatDto

      await expect(useCase.sendChat(dto, 'user-1')).rejects.toThrow(BadRequestException)
      await expect(useCase.sendChat(dto, 'user-1')).rejects.toThrow('메시지가 비어 있습니다.')
    })
  })

  describe('switchTeam', () => {
    it('진영 변경 투표를 처리한다', async () => {
      const mockState = createMockState()
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      await useCase.switchTeam('battle-1', 'user-1', BATTLE_TEAM.B)

      expect(teamSwitchService.applyTeamVote).toHaveBeenCalledWith(mockState, 'user-1', BATTLE_TEAM.B)
      expect(stateRepo.saveBattleState).toHaveBeenCalled()
    })
  })
})
