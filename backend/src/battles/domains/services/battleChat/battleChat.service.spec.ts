import { Test, TestingModule } from '@nestjs/testing'
import { BattleChatService } from './battleChat.service'
import { ActiveBattleState } from '../../models/types/battle.types'
import { BATTLE_TEAM, BATTLE_CHAT_SCOPE } from '../../models/const/battles.const'

describe('BattleChatService', () => {
  let service: BattleChatService
  let stateStore: Map<string, ActiveBattleState>

  const createActiveState = (overrides: Partial<ActiveBattleState> = {}): ActiveBattleState => ({
    battleId: 'battle-1',
    all: { roomId: 'battle:battle-1', chats: [], attacks: [], defenses: [] },
    teamA: { roomId: 'battle:battle-1:A', chats: [], users: [], attacks: [], defenses: [] },
    teamB: { roomId: 'battle:battle-1:B', chats: [], users: [], attacks: [], defenses: [] },
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
})
