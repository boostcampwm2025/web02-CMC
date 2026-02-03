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

    it('applyAttack: opinionHistory에 공격 의견이 저장된다', () => {
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

    it('applyDefense: opinionHistory에 수비 의견이 저장된다', () => {
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

    it('공격 2개 + 수비 1개가 opinionHistory에 누적된다', () => {
      // ATTACK 1
      state.phase = BATTLE_PHASE.ATTACK.name
      service.applyAttack(
        state,
        'user-1',
        '첫 번째 공격',
        BATTLE_TEAM.A,
        'attack-1',
        () => 'User1',
        () => true,
      )

      // ATTACK 2
      state.phase = BATTLE_PHASE.ATTACK.name
      service.applyAttack(
        state,
        'user-2',
        '두 번째 공격',
        BATTLE_TEAM.B,
        'attack-2',
        () => 'User2',
        () => true,
      )

      // DEFENSE 1
      state.phase = BATTLE_PHASE.DEFENSE.name
      service.applyDefense(
        state,
        'user-1',
        '첫 번째 수비',
        BATTLE_TEAM.A,
        'defense-1',
        () => 'User1',
        () => true,
      )

      expect(state.opinionHistory.length).toBe(3)
      expect(state.opinionHistory[0].type).toBe('ATTACK')
      expect(state.opinionHistory[1].type).toBe('ATTACK')
      expect(state.opinionHistory[2].type).toBe('DEFENSE')
    })

    it('applyAttack 호출 시 opinionHistory와 teamA/teamB 배열이 같은 객체를 참조한다', () => {
      state.phase = BATTLE_PHASE.ATTACK.name

      const attackA = service.applyAttack(
        state,
        'user-1',
        'A팀 공격',
        BATTLE_TEAM.A,
        'attack-a',
        () => 'User1',
        () => true,
      )

      const attackB = service.applyAttack(
        state,
        'user-2',
        'B팀 공격',
        BATTLE_TEAM.B,
        'attack-b',
        () => 'User2',
        () => true,
      )

      // opinionHistory에 모두 저장
      expect(state.opinionHistory.length).toBe(2)

      // teamA/teamB에도 각각 저장 (applyAttack이 team별 배열에 넣는 구조라는 전제)
      expect(state.teamA.attacks.length).toBe(1)
      expect(state.teamB.attacks.length).toBe(1)

      // 같은 객체 참조 확인
      expect(state.opinionHistory[0]).toBe(state.teamA.attacks[0])
      expect(state.opinionHistory[1]).toBe(state.teamB.attacks[0])

      // 반환값도 같은 객체인지
      expect(attackA).toBe(state.opinionHistory[0])
      expect(attackB).toBe(state.opinionHistory[1])
    })
  })
})
