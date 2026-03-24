import { Test, TestingModule } from '@nestjs/testing'
import { BattleMvpService } from './battleMvp.service'
import { ActiveBattleState, BattleDefense } from '../../models/types/battle.types'
import { BATTLE_PHASE, BATTLE_TEAM } from '../../models/const/battles.const'

describe('BattleMvpService', () => {
  let service: BattleMvpService
  let stateStore: Map<string, ActiveBattleState>

  const createActiveState = (overrides: Partial<ActiveBattleState> = {}): ActiveBattleState => ({
    battleId: 'battle-1',
    status: 'OPEN',
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

  const getState = (battleId: string): ActiveBattleState => {
    return stateStore.get(battleId) || createActiveState({ battleId })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BattleMvpService],
    }).compile()

    service = module.get(BattleMvpService)
    stateStore = new Map()
  })

  describe('buildMvps', () => {
    beforeEach(() => {
      const state = createActiveState({ battleId: 'battle-1' })
      state.participants.set('user-1', BATTLE_TEAM.A)
      state.participants.set('user-2', BATTLE_TEAM.B)
      state.participants.set('user-3', BATTLE_TEAM.A)
      stateStore.set('battle-1', state)
    })

    it('case', () => {
      const state = getState('battle-1')
      state.phase = BATTLE_PHASE.ATTACK.name

      // user-1: 2개 의견, 총 5표
      state.opinionHistory.push({
        discussionId: 'attack-1',
        author: { authorId: 'user-1', nickname: 'User1' },
        type: 'ATTACK',
        content: 'attack 1',
        upvotes: 3,
        votes: ['voter-1', 'voter-2', 'voter-3'],
        status: 'SELECTED',
        team: BATTLE_TEAM.A,
        selectedAt: Date.now(),
      })
      state.opinionHistory.push({
        discussionId: 'attack-2',
        author: { authorId: 'user-1', nickname: 'User1' },
        type: 'ATTACK',
        content: 'attack 2',
        upvotes: 2,
        votes: ['voter-4', 'voter-5'],
        status: 'PENDING',
        team: BATTLE_TEAM.A,
      })

      // user-2: 1개 의견, 총 4표
      state.opinionHistory.push({
        discussionId: 'attack-3',
        author: { authorId: 'user-2', nickname: 'User2' },
        type: 'ATTACK',
        content: 'attack 3',
        upvotes: 4,
        votes: ['voter-1', 'voter-2', 'voter-3', 'voter-4'],
        status: 'SELECTED',
        team: BATTLE_TEAM.B,
        selectedAt: Date.now(),
      })

      // 팀별 투표 참가자 수 설정 (A팀: 5명, B팀: 4명)
      const mvps = service.buildMvps(state, 'A')

      // user-1: score = 3/5 + 2/5 = 1.0, totalVotes = 5
      // user-2: score = 4/4 = 1.0, totalVotes = 4
      // 점수 동점 → 좋아요 수 비교 → user-1이 5표로 MVP
      expect(mvps.length).toBeGreaterThan(0)
      expect(mvps[0].userId).toBe('user-1')
      expect(mvps[0].totalVotes).toBe(5)
    })

    it('case', () => {
      const state = getState('battle-1')
      state.phase = BATTLE_PHASE.ATTACK.name

      // 중립 팀 사용자 추가
      state.participants.set('user-none', BATTLE_TEAM.NONE)

      // 중립 팀 사용자가 가장 많은 표를 받았다고 가정 (실제로는 의견 제출 불가하지만 테스트용)
      state.opinionHistory.push({
        discussionId: 'attack-1',
        author: { authorId: 'user-none', nickname: 'NeutralUser' },
        type: 'ATTACK',
        content: 'neutral attack',
        upvotes: 100,
        votes: [],
        status: 'SELECTED',
        team: BATTLE_TEAM.NONE,
        selectedAt: Date.now(),
      })

      state.opinionHistory.push({
        discussionId: 'attack-2',
        author: { authorId: 'user-1', nickname: 'User1' },
        type: 'ATTACK',
        content: 'attack',
        upvotes: 1,
        votes: ['voter-1'],
        status: 'PENDING',
        team: BATTLE_TEAM.A,
      })

      const mvps = service.buildMvps(state, 'A')

      // 중립 팀 제외, user-1이 MVP
      expect(mvps.length).toBeGreaterThan(0)
      expect(mvps[0].userId).toBe('user-1')
    })

    it('case', () => {
      const state = getState('battle-1')
      state.phase = BATTLE_PHASE.ATTACK.name

      // 동일한 점수, 좋아요, 의견 수
      state.opinionHistory.push({
        discussionId: 'attack-1',
        author: { authorId: 'user-1', nickname: 'User1' },
        type: 'ATTACK',
        content: 'attack',
        upvotes: 2,
        votes: ['v1', 'v2'],
        status: 'PENDING',
        team: BATTLE_TEAM.A,
      })

      state.opinionHistory.push({
        discussionId: 'attack-2',
        author: { authorId: 'user-2', nickname: 'User2' },
        type: 'ATTACK',
        content: 'attack',
        upvotes: 2,
        votes: ['v3', 'v4'],
        status: 'PENDING',
        team: BATTLE_TEAM.B,
      })

      // A팀이 승리한 경우
      const mvpsA = service.buildMvps(state, 'A')
      expect(mvpsA[0].userId).toBe('user-1')
      expect(mvpsA[0].team).toBe('A')

      // B팀이 승리한 경우
      const mvpsB = service.buildMvps(state, 'B')
      expect(mvpsB[0].userId).toBe('user-2')
      expect(mvpsB[0].team).toBe('B')
    })

    it('case', () => {
      const state = getState('battle-1')
      state.phase = BATTLE_PHASE.ATTACK.name

      // user-1: 2개 의견, 2개 선정됨
      state.opinionHistory.push({
        discussionId: 'attack-1',
        author: { authorId: 'user-1', nickname: 'User1' },
        type: 'ATTACK',
        content: 'attack 1',
        upvotes: 1,
        votes: ['v1'],
        status: 'SELECTED',
        team: BATTLE_TEAM.A,
        selectedAt: Date.now(),
      })
      state.opinionHistory.push({
        discussionId: 'attack-2',
        author: { authorId: 'user-1', nickname: 'User1' },
        type: 'ATTACK',
        content: 'attack 2',
        upvotes: 1,
        votes: ['v2'],
        status: 'SELECTED',
        team: BATTLE_TEAM.A,
        selectedAt: Date.now(),
      })

      // user-3: 2개 의견, 0개 선정됨
      state.opinionHistory.push({
        discussionId: 'attack-3',
        author: { authorId: 'user-3', nickname: 'User3' },
        type: 'ATTACK',
        content: 'attack 3',
        upvotes: 1,
        votes: ['v3'],
        status: 'PENDING',
        team: BATTLE_TEAM.A,
      })
      state.opinionHistory.push({
        discussionId: 'attack-4',
        author: { authorId: 'user-3', nickname: 'User3' },
        type: 'ATTACK',
        content: 'attack 4',
        upvotes: 1,
        votes: ['v4'],
        status: 'PENDING',
        team: BATTLE_TEAM.A,
      })

      const mvps = service.buildMvps(state, 'A')

      // 동일 점수, 좋아요, 의견수, 팀 → 선정된 의견 수로 비교
      expect(mvps[0].userId).toBe('user-1')
      expect(mvps[0].selectedOpinionCount).toBe(2)
    })

    it('case', () => {
      const state = getState('battle-1')
      state.phase = BATTLE_PHASE.ATTACK.name

      // user-1 (참가순서: 0)과 user-3 (참가순서: 2) 동일 조건
      state.opinionHistory.push({
        discussionId: 'attack-1',
        author: { authorId: 'user-1', nickname: 'User1' },
        type: 'ATTACK',
        content: 'attack',
        upvotes: 1,
        votes: ['v1'],
        status: 'PENDING',
        team: BATTLE_TEAM.A,
      })

      state.opinionHistory.push({
        discussionId: 'attack-2',
        author: { authorId: 'user-3', nickname: 'User3' },
        type: 'ATTACK',
        content: 'attack',
        upvotes: 1,
        votes: ['v2'],
        status: 'PENDING',
        team: BATTLE_TEAM.A,
      })

      const mvps = service.buildMvps(state, 'A')

      // 모든 조건 동일 → 먼저 참여한 user-1이 MVP (참가순서 0)
      expect(mvps[0].userId).toBe('user-1')
      expect(mvps[0].joinedAt).toBe(0) // participants Map 삽입 순서 기반
    })

    it('case', () => {
      const state = getState('battle-1')
      const mvps = service.buildMvps(state, 'A')
      expect(mvps).toEqual([])
    })

    it('case', () => {
      const state = getState('battle-1')
      state.phase = BATTLE_PHASE.ATTACK.name

      // 투표자가 없는 의견
      state.opinionHistory.push({
        discussionId: 'attack-1',
        author: { authorId: 'user-1', nickname: 'User1' },
        type: 'ATTACK',
        content: 'attack',
        upvotes: 0,
        votes: [],
        status: 'PENDING',
        team: BATTLE_TEAM.A,
      })

      const mvps = service.buildMvps(state, 'A')
      expect(mvps.length).toBeGreaterThan(0)
      expect(mvps[0].score).toBe(0)
    })

    it('case', () => {
      const state = getState('battle-1')
      state.phase = BATTLE_PHASE.ATTACK.name

      // user-1: 2개 의견, 페이즈별 투표 참가자 수가 다름
      // 1차 페이즈: 2표/4명 = 0.5점
      state.opinionHistory.push({
        discussionId: 'attack-1',
        author: { authorId: 'user-1', nickname: 'User1' },
        type: 'ATTACK',
        content: 'attack 1',
        upvotes: 2,
        votes: ['v1', 'v2'],
        status: 'SELECTED',
        team: BATTLE_TEAM.A,
        selectedAt: Date.now(),
        voterCountAtPhase: 4, // 1차 페이즈에서 4명 참여
      })
      // 2차 페이즈: 3표/10명 = 0.3점
      state.opinionHistory.push({
        discussionId: 'attack-2',
        author: { authorId: 'user-1', nickname: 'User1' },
        type: 'ATTACK',
        content: 'attack 2',
        upvotes: 3,
        votes: ['v3', 'v4', 'v5'],
        status: 'PENDING',
        team: BATTLE_TEAM.A,
        voterCountAtPhase: 10, // 2차 페이즈에서 10명 참여
      })

      // user-2: 1개 의견
      // 1차 페이즈: 4표/4명 = 1.0점
      state.opinionHistory.push({
        discussionId: 'attack-3',
        author: { authorId: 'user-2', nickname: 'User2' },
        type: 'ATTACK',
        content: 'attack 3',
        upvotes: 4,
        votes: ['v1', 'v2', 'v3', 'v4'],
        status: 'SELECTED',
        team: BATTLE_TEAM.B,
        selectedAt: Date.now(),
        voterCountAtPhase: 4, // B팀 1차 페이즈에서 4명 참여
      })

      const mvps = service.buildMvps(state, 'A')

      // user-1 (A팀): score = (0.5 + 0.3) * 1.5 = 1.2, totalVotes = 5
      // user-2 (B팀): score = 1.0 (보너스 없음), totalVotes = 4
      // A팀 승리 시 user-1이 보너스를 받아 MVP
      expect(mvps.length).toBeGreaterThan(0)
      expect(mvps[0].userId).toBe('user-1')
      expect(mvps[0].score).toBeCloseTo(1.2)
      expect(mvps[0].totalVotes).toBe(5)
    })

    it('case', () => {
      const state = getState('battle-1')
      state.phase = BATTLE_PHASE.ATTACK.name

      // voterCountAtPhase가 없는 의견
      state.opinionHistory.push({
        discussionId: 'attack-1',
        author: { authorId: 'user-1', nickname: 'User1' },
        type: 'ATTACK',
        content: 'attack',
        upvotes: 10,
        votes: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10'],
        status: 'PENDING',
        team: BATTLE_TEAM.A,
        // voterCountAtPhase 없음
      })

      // voterCountAtPhase가 있는 의견
      state.opinionHistory.push({
        discussionId: 'attack-2',
        author: { authorId: 'user-3', nickname: 'User3' },
        type: 'ATTACK',
        content: 'attack 2',
        upvotes: 1,
        votes: ['v1'],
        status: 'PENDING',
        team: BATTLE_TEAM.A,
        voterCountAtPhase: 2,
      })

      const mvps = service.buildMvps(state, 'A')

      // user-1 (A팀): voterCountAtPhase 없음 → 점수 0 * 1.5 = 0, totalVotes = 10
      // user-3 (A팀): score = 1/2 * 1.5 = 0.75, totalVotes = 1
      // user-3이 점수가 높으므로 MVP
      expect(mvps.length).toBeGreaterThan(0)
      expect(mvps[0].userId).toBe('user-3')
      expect(mvps[0].score).toBeCloseTo(0.75)
    })
  })

  describe('buildMvps (승리 팀 1.5배 보너스)', () => {
    beforeEach(() => {
      const state = createActiveState({ battleId: 'battle-1' })
      state.participants.set('user-a', BATTLE_TEAM.A)
      state.participants.set('user-b', BATTLE_TEAM.B)
      stateStore.set('battle-1', state)
    })

    it('case', () => {
      const state = getState('battle-1')
      state.phase = BATTLE_PHASE.ATTACK.name

      // user-a (A팀): 70표 / 100명 = 0.7점 → 1.5배 보너스 → 1.05점
      state.opinionHistory.push({
        discussionId: 'attack-1',
        author: { authorId: 'user-a', nickname: 'UserA' },
        type: 'ATTACK',
        content: 'attack from A',
        upvotes: 70,
        votes: Array(70).fill('voter'),
        status: 'SELECTED',
        team: BATTLE_TEAM.A,
        selectedAt: Date.now(),
        voterCountAtPhase: 100,
      })

      // user-b (B팀): 5표 / 5명 = 1.0점 → 보너스 없음 → 1.0점
      state.opinionHistory.push({
        discussionId: 'attack-2',
        author: { authorId: 'user-b', nickname: 'UserB' },
        type: 'ATTACK',
        content: 'attack from B',
        upvotes: 5,
        votes: Array(5).fill('voter'),
        status: 'SELECTED',
        team: BATTLE_TEAM.B,
        selectedAt: Date.now(),
        voterCountAtPhase: 5,
      })

      // A팀 승리 시: user-a = 0.7 * 1.5 = 1.05, user-b = 1.0
      const mvpsWhenAWins = service.buildMvps(state, 'A')
      expect(mvpsWhenAWins.length).toBeGreaterThan(0)
      expect(mvpsWhenAWins[0].userId).toBe('user-a')
      expect(mvpsWhenAWins[0].score).toBeCloseTo(1.05)
    })

    it('case', () => {
      const state = getState('battle-1')
      state.phase = BATTLE_PHASE.ATTACK.name

      // user-a (A팀): 70표 / 100명 = 0.7점 → 보너스 없음 → 0.7점
      state.opinionHistory.push({
        discussionId: 'attack-1',
        author: { authorId: 'user-a', nickname: 'UserA' },
        type: 'ATTACK',
        content: 'attack from A',
        upvotes: 70,
        votes: Array(70).fill('voter'),
        status: 'SELECTED',
        team: BATTLE_TEAM.A,
        selectedAt: Date.now(),
        voterCountAtPhase: 100,
      })

      // user-b (B팀): 5표 / 5명 = 1.0점 → 1.5배 보너스 → 1.5점
      state.opinionHistory.push({
        discussionId: 'attack-2',
        author: { authorId: 'user-b', nickname: 'UserB' },
        type: 'ATTACK',
        content: 'attack from B',
        upvotes: 5,
        votes: Array(5).fill('voter'),
        status: 'SELECTED',
        team: BATTLE_TEAM.B,
        selectedAt: Date.now(),
        voterCountAtPhase: 5,
      })

      // B팀 승리 시: user-a = 0.7, user-b = 1.0 * 1.5 = 1.5
      const mvpsWhenBWins = service.buildMvps(state, 'B')
      expect(mvpsWhenBWins.length).toBeGreaterThan(0)
      expect(mvpsWhenBWins[0].userId).toBe('user-b')
      expect(mvpsWhenBWins[0].score).toBeCloseTo(1.5)
    })

    it('case', () => {
      const state = getState('battle-1')
      state.phase = BATTLE_PHASE.ATTACK.name

      // user-a (A팀): 70표 / 100명 = 0.7점
      state.opinionHistory.push({
        discussionId: 'attack-1',
        author: { authorId: 'user-a', nickname: 'UserA' },
        type: 'ATTACK',
        content: 'attack from A',
        upvotes: 70,
        votes: Array(70).fill('voter'),
        status: 'SELECTED',
        team: BATTLE_TEAM.A,
        selectedAt: Date.now(),
        voterCountAtPhase: 100,
      })

      // user-b (B팀): 5표 / 5명 = 1.0점
      state.opinionHistory.push({
        discussionId: 'attack-2',
        author: { authorId: 'user-b', nickname: 'UserB' },
        type: 'ATTACK',
        content: 'attack from B',
        upvotes: 5,
        votes: Array(5).fill('voter'),
        status: 'SELECTED',
        team: BATTLE_TEAM.B,
        selectedAt: Date.now(),
        voterCountAtPhase: 5,
      })

      // 무승부: user-a = 0.7, user-b = 1.0 → user-b가 MVP
      const mvpsWhenDraw = service.buildMvps(state, 'DRAW')
      expect(mvpsWhenDraw.length).toBeGreaterThan(0)
      expect(mvpsWhenDraw[0].userId).toBe('user-b')
      expect(mvpsWhenDraw[0].score).toBeCloseTo(1.0)
    })

    it('case', () => {
      const state = getState('battle-1')
      state.participants.set('user-a2', BATTLE_TEAM.A)
      state.phase = BATTLE_PHASE.ATTACK.name

      // user-a: 50표 / 100명 = 0.5점 → 1.5배 → 0.75점, totalVotes = 50
      state.opinionHistory.push({
        discussionId: 'attack-1',
        author: { authorId: 'user-a', nickname: 'UserA' },
        type: 'ATTACK',
        content: 'attack from A',
        upvotes: 50,
        votes: Array(50).fill('voter'),
        status: 'SELECTED',
        team: BATTLE_TEAM.A,
        selectedAt: Date.now(),
        voterCountAtPhase: 100,
      })

      // user-a2: 10표 / 20명 = 0.5점 → 1.5배 → 0.75점, totalVotes = 10
      state.opinionHistory.push({
        discussionId: 'attack-2',
        author: { authorId: 'user-a2', nickname: 'UserA2' },
        type: 'ATTACK',
        content: 'attack from A2',
        upvotes: 10,
        votes: Array(10).fill('voter'),
        status: 'SELECTED',
        team: BATTLE_TEAM.A,
        selectedAt: Date.now(),
        voterCountAtPhase: 20,
      })

      const mvps = service.buildMvps(state, 'A')
      expect(mvps.length).toBeGreaterThan(0)
      // 점수 동점 → totalVotes로 비교 → user-a가 50표로 MVP
      expect(mvps[0].userId).toBe('user-a')
      expect(mvps[0].totalVotes).toBe(50)
    })

    it('case', () => {
      const state = getState('battle-1')
      state.phase = BATTLE_PHASE.ATTACK.name

      // user-a: 2개 의견, 각각 30표/100명 = 0.3 + 0.3 = 0.6점 → 1.5배 → 0.9점
      state.opinionHistory.push({
        discussionId: 'attack-1',
        author: { authorId: 'user-a', nickname: 'UserA' },
        type: 'ATTACK',
        content: 'attack 1 from A',
        upvotes: 30,
        votes: Array(30).fill('voter'),
        status: 'SELECTED',
        team: BATTLE_TEAM.A,
        selectedAt: Date.now(),
        voterCountAtPhase: 100,
      })
      state.opinionHistory.push({
        discussionId: 'defense-1',
        author: { authorId: 'user-a', nickname: 'UserA' },
        type: 'DEFENSE',
        content: 'defense 1 from A',
        upvotes: 30,
        votes: Array(30).fill('voter'),
        status: 'SELECTED',
        team: BATTLE_TEAM.A,
        selectedAt: Date.now(),
        voterCountAtPhase: 100,
        attackId: 'attack-x',
      } as BattleDefense)

      // user-b: 1개 의견, 5표/10명 = 0.5점 → 보너스 없음 → 0.5점
      state.opinionHistory.push({
        discussionId: 'attack-2',
        author: { authorId: 'user-b', nickname: 'UserB' },
        type: 'ATTACK',
        content: 'attack from B',
        upvotes: 5,
        votes: Array(5).fill('voter'),
        status: 'SELECTED',
        team: BATTLE_TEAM.B,
        selectedAt: Date.now(),
        voterCountAtPhase: 10,
      })

      // A팀 승리: user-a = 0.6 * 1.5 = 0.9, user-b = 0.5
      const mvps = service.buildMvps(state, 'A')
      expect(mvps.length).toBeGreaterThan(0)
      expect(mvps[0].userId).toBe('user-a')
      expect(mvps[0].score).toBeCloseTo(0.9)
      expect(mvps[0].opinionCount).toBe(2)
    })

    it('case', () => {
      const state = getState('battle-1')
      state.phase = BATTLE_PHASE.ATTACK.name

      // user-a (A팀, 다수): 80표 / 100명 = 0.8점 → 1.5배 → 1.2점
      state.opinionHistory.push({
        discussionId: 'attack-1',
        author: { authorId: 'user-a', nickname: 'UserA' },
        type: 'ATTACK',
        content: 'attack from A',
        upvotes: 80,
        votes: Array(80).fill('voter'),
        status: 'SELECTED',
        team: BATTLE_TEAM.A,
        selectedAt: Date.now(),
        voterCountAtPhase: 100,
      })

      // user-b (B팀, 소수): 3표 / 3명 = 1.0점 → 보너스 없음 → 1.0점
      state.opinionHistory.push({
        discussionId: 'attack-2',
        author: { authorId: 'user-b', nickname: 'UserB' },
        type: 'ATTACK',
        content: 'attack from B',
        upvotes: 3,
        votes: Array(3).fill('voter'),
        status: 'SELECTED',
        team: BATTLE_TEAM.B,
        selectedAt: Date.now(),
        voterCountAtPhase: 3,
      })

      // A팀 승리: user-a = 0.8 * 1.5 = 1.2 > user-b = 1.0
      const mvps = service.buildMvps(state, 'A')
      expect(mvps.length).toBeGreaterThan(0)
      expect(mvps[0].userId).toBe('user-a')
      expect(mvps[0].score).toBeCloseTo(1.2)
    })
  })

  describe('resetDiscussions 후 MVP 계산', () => {
    beforeEach(() => {
      const state = createActiveState({ battleId: 'battle-1' })
      state.participants.set('user-1', BATTLE_TEAM.A)
      state.participants.set('user-2', BATTLE_TEAM.B)
      stateStore.set('battle-1', state)
    })

    it('case', () => {
      const state = getState('battle-1')
      state.phase = BATTLE_PHASE.ATTACK.name

      // 의견 등록
      state.opinionHistory.push({
        discussionId: 'attack-1',
        author: { authorId: 'user-1', nickname: 'User1' },
        type: 'ATTACK',
        content: 'attack 1',
        upvotes: 5,
        votes: ['v1', 'v2', 'v3', 'v4', 'v5'],
        status: 'SELECTED',
        team: BATTLE_TEAM.A,
        voterCountAtPhase: 10,
      })
      state.teamA.attacks.push(state.opinionHistory[0])

      state.opinionHistory.push({
        discussionId: 'attack-2',
        author: { authorId: 'user-2', nickname: 'User2' },
        type: 'ATTACK',
        content: 'attack 2',
        upvotes: 3,
        votes: ['v1', 'v2', 'v3'],
        status: 'PENDING',
        team: BATTLE_TEAM.B,
        voterCountAtPhase: 10,
      })
      state.teamB.attacks.push(state.opinionHistory[1])

      // resetDiscussions 호출 전 상태 확인
      expect(state.opinionHistory.length).toBe(2)
      expect(state.teamA.attacks.length).toBe(1)
      expect(state.teamB.attacks.length).toBe(1)

      // resetDiscussions 호출 (teamA/teamB만 초기화)
      state.teamA.attacks = []
      state.teamB.attacks = []

      // resetDiscussions 후 상태 확인
      expect(state.opinionHistory.length).toBe(2) // opinionHistory는 유지
      expect(state.teamA.attacks.length).toBe(0) // teamA는 초기화
      expect(state.teamB.attacks.length).toBe(0) // teamB는 초기화

      // MVP 계산 - opinionHistory에서 읽으므로 정상 동작
      const mvps = service.buildMvps(state, 'A')

      expect(mvps.length).toBeGreaterThan(0)
      expect(mvps[0].userId).toBe('user-1')
      expect(mvps[0].totalVotes).toBe(5)
    })

    it('case', () => {
      const state = getState('battle-1')
      state.phase = BATTLE_PHASE.ATTACK.name

      // 1라운드 의견
      state.opinionHistory.push({
        discussionId: 'attack-r1',
        author: { authorId: 'user-1', nickname: 'User1' },
        type: 'ATTACK',
        content: 'round 1 attack',
        upvotes: 3,
        votes: ['v1', 'v2', 'v3'],
        status: 'SELECTED',
        team: BATTLE_TEAM.A,
        voterCountAtPhase: 5,
      })
      state.teamA.attacks.push(state.opinionHistory[0])

      // 1라운드 후 reset
      state.teamA.attacks = []
      expect(state.teamA.attacks.length).toBe(0)

      // 2라운드 의견
      state.opinionHistory.push({
        discussionId: 'attack-r2',
        author: { authorId: 'user-1', nickname: 'User1' },
        type: 'ATTACK',
        content: 'round 2 attack',
        upvotes: 4,
        votes: ['v1', 'v2', 'v3', 'v4'],
        status: 'SELECTED',
        team: BATTLE_TEAM.A,
        voterCountAtPhase: 5,
      })
      state.teamA.attacks.push(state.opinionHistory[1])

      // 2라운드 후 reset
      state.teamA.attacks = []
      expect(state.teamA.attacks.length).toBe(0)

      // opinionHistory에는 2개 의견이 누적되어 있어야 함
      expect(state.opinionHistory.length).toBe(2)

      // MVP 계산 - 누적 점수로 계산
      const mvps = service.buildMvps(state, 'A')

      expect(mvps.length).toBeGreaterThan(0)
      expect(mvps[0].userId).toBe('user-1')
      // user-1: score = 3/5 + 4/5 = 1.4, 승리팀 보너스 1.5배 = 2.1
      expect(mvps[0].score).toBeCloseTo(2.1)
      expect(mvps[0].totalVotes).toBe(7) // 3 + 4
      expect(mvps[0].opinionCount).toBe(2)
    })
  })
})
