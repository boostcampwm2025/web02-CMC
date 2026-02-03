import { Test, TestingModule } from '@nestjs/testing'
import { BattleDiscussionService } from './battleDiscussion.service'
import { ActiveBattleState } from '../models/types/battle.types'
import { BATTLE_PHASE, BATTLE_TEAM } from '../models/const/battles.const'

describe('BattleDiscussionService', () => {
  let service: BattleDiscussionService

  const createActiveState = (overrides: Partial<ActiveBattleState> = {}): ActiveBattleState => ({
    battleId: 'battle-1',
    all: { roomId: 'battle:battle-1', chats: [], attacks: [], defenses: [] },
    teamA: { roomId: 'battle:battle-1:A', chats: [], users: [], attacks: [], defenses: [] },
    teamB: { roomId: 'battle:battle-1:B', chats: [], users: [], attacks: [], defenses: [] },
    phase: BATTLE_PHASE.ATTACK.name,
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BattleDiscussionService],
    }).compile()

    service = module.get(BattleDiscussionService)
  })

  describe('BattleDiscussionService', () => {
    let state: ActiveBattleState

    beforeEach(() => {
      state = createActiveState({ battleId: 'battle-1' })
      state.participants.set('user-1', BATTLE_TEAM.A)
      state.participants.set('user-2', BATTLE_TEAM.B)
      state.userInfoMap.set('user-1', 'User1')
      state.userInfoMap.set('user-2', 'User2')
    })

    it('case', () => {
      state.phase = BATTLE_PHASE.ATTACK.name
      expect(state.opinionHistory.length).toBe(0)

      const attack = service.applyAttack(
        state,
        'user-1',
        '공격 의견입니다',
        BATTLE_TEAM.A,
        'attack-1',
        () => 'User1',
        () => true,
      )

      expect(state.opinionHistory.length).toBe(1)
      expect(state.opinionHistory[0].content).toBe('공격 의견입니다')
      expect(state.opinionHistory[0].author.authorId).toBe('user-1')
      expect(state.opinionHistory[0].status).toBe('PENDING')
      expect(state.opinionHistory[0].type).toBe('ATTACK')
      expect(attack).toBe(state.opinionHistory[0])
    })

    it('case', () => {
      state.phase = BATTLE_PHASE.DEFENSE.name
      expect(state.opinionHistory.length).toBe(0)

      const defense = service.applyDefense(
        state,
        'user-2',
        '수비 의견입니다',
        BATTLE_TEAM.B,
        'defense-1',
        () => 'User2',
        () => true,
      )

      expect(state.opinionHistory.length).toBe(1)
      expect(state.opinionHistory[0].content).toBe('수비 의견입니다')
      expect(state.opinionHistory[0].author.authorId).toBe('user-2')
      expect(state.opinionHistory[0].status).toBe('PENDING')
      expect(state.opinionHistory[0].type).toBe('DEFENSE')
      expect(defense).toBe(state.opinionHistory[0])
    })

    it('case', () => {
      state.phase = BATTLE_PHASE.ATTACK.name
      state.phase = BATTLE_PHASE.DEFENSE.name
      expect(state.opinionHistory.length).toBe(3)
      expect(state.opinionHistory[0].type).toBe('ATTACK')
      expect(state.opinionHistory[1].type).toBe('ATTACK')
      expect(state.opinionHistory[2].type).toBe('DEFENSE')
    })

    it('case', () => {
      state.phase = BATTLE_PHASE.ATTACK.name

      // opinionHistory에 모두 저장
      expect(state.opinionHistory.length).toBe(2)

      // teamA/teamB에도 각각 저장
      expect(state.teamA.attacks.length).toBe(1)
      expect(state.teamB.attacks.length).toBe(1)

      // 같은 객체를 참조
      expect(state.opinionHistory[0]).toBe(state.teamA.attacks[0])
      expect(state.opinionHistory[1]).toBe(state.teamB.attacks[0])
    })
  })
})
