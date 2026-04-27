import { Test, TestingModule } from '@nestjs/testing'
import { BattleChatService } from './battleChat.service'
import { ActiveBattleState } from '../../models/types/battle.types'
import { BATTLE_TEAM, BATTLE_CHAT_SCOPE } from '../../models/const/battles.const'

describe('BattleChatService', () => {
  let service: BattleChatService
  let stateStore: Map<string, ActiveBattleState>

  const createActiveState = (overrides: Partial<ActiveBattleState> = {}): ActiveBattleState => ({
    battleId: 'battle-1',
    status: 'OPEN',
    all: { roomId: 'battle:battle-1:room:all', chats: [], attacks: [], defenses: [] },
    teamA: { roomId: 'battle:battle-1:room:A', chats: [], users: [], attacks: [], defenses: [] },
    teamB: { roomId: 'battle:battle-1:room:B', chats: [], users: [], attacks: [], defenses: [] },
    phase: 'PENDING',
    participants: new Map(),
    teamVotes: new Map(),
    userInfoMap: new Map(),
    opinionHistory: [],
    skipState: new Set(),
    round: 1,
    topics: [],
    totalRounds: 1,
    phaseCount: 1,
    startedAt: null,
    expiredAt: null,
    ...overrides,
  })

  const getState = (battleId: string): ActiveBattleState | null => {
    return stateStore.get(battleId) || null
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BattleChatService],
    }).compile()

    service = module.get(BattleChatService)
    stateStore = new Map()
  })

  describe('BattleChatService', () => {
    beforeEach(() => {
      const state = createActiveState({ battleId: 'battle-1' })
      state.participants.set('user-1', BATTLE_TEAM.A)
      state.userInfoMap.set('user-1', 'test-user')
      stateStore.set('battle-1', state)
    })

    it('case', () => {
      const state = getState('invalid')
      if (!state) {
        expect(() => {
          const chat = service.buildChatMessage('msg-1', 'user-1', 'test-user', undefined, BATTLE_TEAM.A, 'hello')
          service.applyChatMessage(state!, chat, 'TEAM', BATTLE_TEAM.A)
        }).toThrow()
      }
    })

    it('case', () => {
      const state = getState('battle-1')
      if (!state) throw new Error('State not found')

      const chat = service.buildChatMessage('msg-1', 'user-1', 'test-user', undefined, BATTLE_TEAM.A, 'hello')
      service.applyChatMessage(state, chat, BATTLE_CHAT_SCOPE.TEAM, BATTLE_TEAM.A)

      expect(state.teamA.chats).toHaveLength(1)
      expect(state.all.chats).toHaveLength(0)
      expect(chat).toEqual(
        expect.objectContaining({
          team: BATTLE_TEAM.A,
          sender: { userId: 'user-1', nickname: 'test-user' },
          text: 'hello',
          messageId: 'msg-1',
        }),
      )
    })

    it('case', () => {
      const state = getState('battle-1')
      if (!state) throw new Error('State not found')

      const chat = service.buildChatMessage('msg-1', 'user-1', 'test-user', undefined, BATTLE_TEAM.A, 'hello all')
      service.applyChatMessage(state, chat, BATTLE_CHAT_SCOPE.ALL)

      expect(state.all.chats).toHaveLength(1)
      expect(state.teamA.chats).toHaveLength(0)
      expect(state.teamB.chats).toHaveLength(0)
      expect(chat).toEqual(
        expect.objectContaining({
          sender: { userId: 'user-1', nickname: 'test-user' },
          text: 'hello all',
          messageId: 'msg-1',
        }),
      )
    })
  })

  describe('applyChatMessage 예외 처리', () => {
    it('TEAM scope에서 team이 없으면 예외를 발생시킨다', () => {
      const state = createActiveState()
      const chat = service.buildChatMessage('msg-1', 'user-1', 'test-user', undefined, BATTLE_TEAM.A, 'hello')

      expect(() => {
        service.applyChatMessage(state, chat, BATTLE_CHAT_SCOPE.TEAM)
      }).toThrow('진영 채팅은 team 값이 필요합니다.')
    })

    it('TEAM scope에서 NONE 팀이면 예외를 발생시킨다', () => {
      const state = createActiveState()
      const chat = service.buildChatMessage('msg-1', 'user-1', 'test-user', undefined, BATTLE_TEAM.NONE, 'hello')

      expect(() => {
        service.applyChatMessage(state, chat, BATTLE_CHAT_SCOPE.TEAM, BATTLE_TEAM.NONE)
      }).toThrow('진영 채팅은 A/B 진영만 사용할 수 있습니다.')
    })

    it('B팀 채팅을 올바르게 추가한다', () => {
      const state = createActiveState()
      const chat = service.buildChatMessage('msg-1', 'user-1', 'test-user', undefined, BATTLE_TEAM.B, 'hello B team')

      service.applyChatMessage(state, chat, BATTLE_CHAT_SCOPE.TEAM, BATTLE_TEAM.B)

      expect(state.teamB.chats).toHaveLength(1)
      expect(state.teamA.chats).toHaveLength(0)
      expect(state.teamB.chats[0].text).toBe('hello B team')
    })
  })

  describe('buildChatMessage', () => {
    it('텍스트의 공백을 트림한다', () => {
      const chat = service.buildChatMessage('msg-1', 'user-1', 'test-user', undefined, BATTLE_TEAM.A, '  hello world  ')

      expect(chat.text).toBe('hello world')
    })

    it('tier 정보를 포함한 채팅 메시지를 생성한다', () => {
      const chat = service.buildChatMessage('msg-1', 'user-1', 'test-user', 'gold', BATTLE_TEAM.A, 'hello')

      expect(chat.sender.tier).toBe('gold')
    })

    it('createdAt이 현재 시간으로 설정된다', () => {
      const before = new Date()
      const chat = service.buildChatMessage('msg-1', 'user-1', 'test-user', undefined, BATTLE_TEAM.A, 'hello')
      const after = new Date()

      expect(chat.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(chat.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('모든 필드가 올바르게 설정된다', () => {
      const chat = service.buildChatMessage('msg-123', 'user-456', 'nickname', 'silver', BATTLE_TEAM.B, 'test message')

      expect(chat.messageId).toBe('msg-123')
      expect(chat.team).toBe(BATTLE_TEAM.B)
      expect(chat.sender.userId).toBe('user-456')
      expect(chat.sender.nickname).toBe('nickname')
      expect(chat.sender.tier).toBe('silver')
      expect(chat.text).toBe('test message')
    })
  })
})
