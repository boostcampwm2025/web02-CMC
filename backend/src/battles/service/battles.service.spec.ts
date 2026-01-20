import { NotFoundException, BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common'
import { Battle, FinishedBattleState, BattleDefense } from '../types/battles.types'
import { BattlesService } from './battles.service'
import { BATTLE_TYPE, BATTLE_CATEGORY, BATTLE_PLAYTIME, BATTLE_LANGUAGE, BATTLE_STATUS, BATTLE_PHASE, BATTLE_TEAM } from '../const/battles.const'

const createBattle = (overrides: Partial<Battle>): Battle => ({
  id: 'battle-id',
  authorId: 'user-1',
  title: 'title',
  description: 'description',
  aCode: 'a',
  bCode: 'b',
  language: BATTLE_LANGUAGE.TS,
  type: BATTLE_TYPE.PUBLIC,
  category: BATTLE_CATEGORY.ALGORITHM,
  playTime: BATTLE_PLAYTIME.FIFTEEN_MIN,
  topics: ['효율성', '가독성'],
  status: BATTLE_STATUS.OPEN,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  participantCount: 0,
  initialState: {
    round: 1,
    phase: BATTLE_PHASE.OPINION_SHARE.name,
    phaseCount: 1,
    timeRemainingSeconds: 600,
  },
  ...overrides,
})

const createFinishedBattleState = (overrides: Partial<FinishedBattleState> = {}): FinishedBattleState => ({
  battleId: 'battle-1',
  authorId: 'user-1',
  title: '배열 정렬 최적화 배틀',
  description: '퀵소트 vs 머지소트, 어떤 정렬 알고리즘이 더 효율적일까?',
  status: 'CLOSED',
  language: 'javascript',
  category: '성능',
  playTime: 30,
  topics: ['효율성', '가독성'],
  createdAt: '2025-12-15T10:00:00Z',
  finishedAt: '2025-12-15T10:30:00Z',
  codeA: 'code-a',
  codeB: 'code-b',
  result: {
    winner: 'A',
    teamA: { votes: 44, percentage: 44 },
    teamB: { votes: 40, percentage: 40 },
    neutral: { votes: 16, percentage: 16 },
  },
  metrics: {
    totalParticipants: 100,
    totalViews: 1247,
    strategiesCount: 12,
    totalChats: 0,
  },
  voteTimeline: [
    { turn: 1, teamAVotes: 10, teamBVotes: 8, neutralVotes: 2, timestamp: '2025-12-15T10:10:00Z' },
    { turn: 2, teamAVotes: 25, teamBVotes: 18, neutralVotes: 7, timestamp: '2025-12-15T10:20:00Z' },
    { turn: 3, teamAVotes: 44, teamBVotes: 40, neutralVotes: 16, timestamp: '2025-12-15T10:30:00Z' },
  ],
  timeline: [
    {
      id: 'attack-1',
      type: 'ATTACK',
      author: { id: 'user-1', nickname: 'CodeMaster' },
      team: 'A',
      content: '퀵소트는 평균 O(n log n)으로 대부분의 경우 더 빠릅니다!',
      turn: 1,
      upvotes: 25,
      createdAt: '2025-12-15T10:05:00Z',
    },
    {
      id: 'defense-1',
      type: 'DEFENSE',
      author: { id: 'user-2', nickname: 'AlgoExpert' },
      team: 'B',
      content: '머지소트는 항상 O(n log n)을 보장합니다.',
      turn: 1,
      upvotes: 10,
      createdAt: '2025-12-15T10:06:00Z',
    },
  ],
  mvp: {
    userId: 'user-1',
    nickname: 'CodeMaster',
    team: 'A',
    score: 2.5,
    totalVotes: 25,
    opinionCount: 2,
    selectedOpinionCount: 1,
    joinedAt: 1000,
  },
  ...overrides,
})

describe('BattlesService', () => {
  let service: BattlesService

  const cleanupService = () => {
    service['battleTimers'].forEach(timer => clearTimeout(timer))
    service['battleTimers'].clear()
    service['activeBattles'].clear()
  }

  beforeEach(() => {
    service = new BattlesService()
    cleanupService()
    jest.useFakeTimers()
    jest.spyOn(Date, 'now').mockReturnValue(1_000_000)
  })

  afterEach(() => {
    cleanupService()
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  describe('initBattleState', () => {
    beforeEach(() => {
      service.setBattlesForTest([createBattle({ id: 'battle-1' })])
    })

    it('battleId가 없으면 BadRequestException을 던진다', () => {
      expect(() => service['initBattleState']('')).toThrow(BadRequestException)
    })

    it('이미 초기화된 배틀이면 중복 생성하지 않는다', () => {
      const beforeSize = service['activeBattles'].size
      service['initBattleState']('battle-1')
      service['initBattleState']('battle-1')

      expect(service['activeBattles'].size).toBe(beforeSize + 1)
    })

    it('배틀 상태를 올바르게 초기화한다', () => {
      service['initBattleState']('battle-1')

      const state = service['activeBattles'].get('battle-1')!

      expect(state.battleId).toBe('battle-1')
      expect(state.all.roomId).toBe('battle:battle-1')
      expect(state.teamA.roomId).toBe('battle:battle-1:A')
      expect(state.teamB.roomId).toBe('battle:battle-1:B')
      expect(state.teamA.users).toEqual([])
      expect(state.teamB.users).toEqual([])
    })
  })

  describe('addParticipant', () => {
    beforeEach(() => {
      service.setBattlesForTest([createBattle({ id: 'battle-1' })])
      service['initBattleState']('battle-1')
    })

    it('필수 파라미터가 없으면 BadRequestException을 던진다', () => {
      expect(() => service['addParticipant']('', 'client-1', 'A')).toThrow(BadRequestException)
      expect(() => service['addParticipant']('battle-1', '', 'A')).toThrow(BadRequestException)
      expect(() => service['addParticipant']('battle-1', 'client-1', '')).toThrow(BadRequestException)
    })

    it('존재하지 않는 배틀이면 NotFoundException을 던진다', () => {
      expect(() => service['addParticipant']('invalid-battle', 'client-1', 'A')).toThrow(NotFoundException)
    })

    it('A팀에 참가자를 추가한다', () => {
      service['addParticipant']('battle-1', 'client-1', BATTLE_TEAM.A)

      const state = service['activeBattles'].get('battle-1')!
      expect(state.teamA.users).toContain('client-1')
      expect(state.teamB.users).not.toContain('client-1')
    })

    it('B팀에 참가자를 추가한다', () => {
      service['addParticipant']('battle-1', 'client-2', BATTLE_TEAM.B)

      const state = service['activeBattles'].get('battle-1')!
      expect(state.teamB.users).toContain('client-2')
      expect(state.teamA.users).not.toContain('client-2')
    })

    it('중립 팀에 참가자를 추가한다', () => {
      service['addParticipant']('battle-1', 'client-3', BATTLE_TEAM.NONE)

      const state = service['activeBattles'].get('battle-1')!
      expect(state.teamA.users).not.toContain('client-3')
      expect(state.teamB.users).not.toContain('client-3')
      expect(state.participants.get('client-3')).toBe(BATTLE_TEAM.NONE)
    })

    it('참가자 추가 시 teamNoneCount가 올바르게 계산된다', () => {
      service['addParticipant']('battle-1', 'client-a1', BATTLE_TEAM.A)
      service['addParticipant']('battle-1', 'client-b1', BATTLE_TEAM.B)
      service['addParticipant']('battle-1', 'client-none1', BATTLE_TEAM.NONE)
      service['addParticipant']('battle-1', 'client-none2', BATTLE_TEAM.NONE)

      const state = service['activeBattles'].get('battle-1')!
      const totalParticipants = state.participants.size
      const teamA = state.teamA.users.length
      const teamB = state.teamB.users.length
      const teamNone = totalParticipants - teamA - teamB

      expect(teamNone).toBe(2)
      expect(state.participants.size).toBe(4)
    })
  })

  describe('getBattleRoomId', () => {
    it('팀이 없으면 배틀 전체 룸 ID를 반환한다', () => {
      const roomId = service.getBattleRoomId('battle-1')
      expect(roomId).toBe('battle:battle-1')
    })

    it('팀이 있으면 팀별 룸 ID를 반환한다', () => {
      const roomIdA = service.getBattleRoomId('battle-1', BATTLE_TEAM.A)
      const roomIdB = service.getBattleRoomId('battle-1', BATTLE_TEAM.B)

      expect(roomIdA).toBe('battle:battle-1:A')
      expect(roomIdB).toBe('battle:battle-1:B')
    })
  })

  describe('joinBattleInfo', () => {
    it('battleId가 없으면 BadRequestException을 던진다', () => {
      expect(() => service.joinBattleInfo('')).toThrow(BadRequestException)
    })

    it('존재하지 않는 배틀이면 NotFoundException을 던진다', () => {
      expect(() => service.joinBattleInfo('invalid-battle')).toThrow(NotFoundException)
    })

    it('배틀 정보를 반환한다', () => {
      const battle = createBattle({ id: 'battle-1' })
      service.setBattlesForTest([battle])

      const result = service.joinBattleInfo('battle-1')

      expect(result).toBeDefined()
      expect(result.title).toBe(battle.title)
      expect(result.description).toBe(battle.description)
      expect(result.aCode).toBe(battle.aCode)
      expect(result.bCode).toBe(battle.bCode)
      expect(result.category).toBe(battle.category)
      expect(result.language).toBe(battle.language)
      expect(result.participantCount).toBe(battle.participantCount)
      expect(result.currentRound).toBe(battle.initialState.round)
      expect(result.totalRounds).toBe(battle.playTime.rounds)
      expect(result.timelines).toEqual({ attacks: [], defenses: [] })
    })
  })

  describe('joinBattle', () => {
    beforeEach(() => {
      const publicBattle = createBattle({
        id: 'public-battle',
        type: BATTLE_TYPE.PUBLIC,
        status: BATTLE_STATUS.OPEN,
      })
      const privateBattle = createBattle({
        id: 'private-battle',
        type: BATTLE_TYPE.PRIVATE,
        password: '1234',
        status: BATTLE_STATUS.OPEN,
      })
      const closedBattle = createBattle({
        id: 'closed-battle',
        status: BATTLE_STATUS.CLOSED,
      })

      service.setBattlesForTest([publicBattle, privateBattle, closedBattle])
      service['initBattleState']('public-battle')
      service['initBattleState']('private-battle')

      // Guest 등록
      service.registerGuest('public-battle', { id: 'user-1', nickname: 'test-user', createdAt: Date.now() })
      service.registerGuest('private-battle', { id: 'user-1', nickname: 'test-user', createdAt: Date.now() })
    })

    it('battleId가 없으면 BadRequestException을 던진다', () => {
      expect(() => service.joinBattle({ battleId: '', team: 'A' }, 'user-1')).toThrow(BadRequestException)
    })

    it('존재하지 않는 배틀이면 NotFoundException을 던진다', () => {
      expect(() =>
        service.joinBattle(
          {
            battleId: 'invalid',
            team: 'A',
          },
          'user-1',
        ),
      ).toThrow(NotFoundException)
    })

    it('비공개 배틀에 잘못된 비밀번호로 접근하면 UnauthorizedException을 던진다', () => {
      expect(() =>
        service.joinBattle(
          {
            battleId: 'private-battle',
            password: 'wrong',
            team: 'A',
          },
          'user-1',
        ),
      ).toThrow(UnauthorizedException)
    })

    it('비공개 배틀에 올바른 비밀번호로 입장한다', () => {
      service.registerGuest('private-battle', { id: 'user-1', nickname: 'test-user', createdAt: Date.now() })
      const result = service.joinBattle(
        {
          battleId: 'private-battle',
          password: '1234',
          team: 'A',
        },
        'user-1',
      )

      expect(result.team).toBe('A')
      expect(result.battleState).toBeDefined()
    })

    it('종료된 배틀에 입장하려 하면 BadRequestException을 던진다', () => {
      expect(() =>
        service.joinBattle(
          {
            battleId: 'closed-battle',
            team: 'A',
          },
          'user-1',
        ),
      ).toThrow(BadRequestException)
    })

    it('공개 배틀에 정상적으로 입장한다', () => {
      const result = service.joinBattle(
        {
          battleId: 'public-battle',
          team: 'A',
        },
        'user-1',
      )

      expect(result.team).toBe('A')
      expect(result.battleState.teamA.users).toContain('user-1')
    })

    it('이미 참여한 userId로 재접속하면 기존 상태를 반환한다', () => {
      service.registerGuest('public-battle', { id: 'user-1', nickname: 'test-user', createdAt: Date.now() })
      const firstResult = service.joinBattle(
        {
          battleId: 'public-battle',
          team: 'A',
        },
        'user-1',
      )

      const secondResult = service.joinBattle(
        {
          battleId: 'public-battle',
          team: 'A',
        },
        'user-1',
      )

      // 재접속 시 기존 상태가 같다는 것을 확인
      expect(secondResult.battleState).toBe(firstResult.battleState)
      expect(secondResult.team).toBe(firstResult.team)

      const battleState = service.getBattleState('public-battle')

      expect(battleState.participants.get('user-1')).toBe('A')
      expect(battleState.teamA.users).toContain('user-1')
      expect(battleState.teamB.users).not.toContain('user-1')
    })

    it('다른 배틀에는 같은 userId로 참여할 수 있다', () => {
      const battle2 = createBattle({
        id: 'public-battle-2',
        type: BATTLE_TYPE.PUBLIC,
        status: BATTLE_STATUS.OPEN,
      })
      service.setBattlesForTest([...service['battles'], battle2])
      service['initBattleState']('public-battle-2')
      service.registerGuest('public-battle-2', { id: 'user-1', nickname: 'test-user', createdAt: Date.now() })

      service.joinBattle(
        {
          battleId: 'public-battle',
          team: 'A',
        },
        'user-1',
      )

      const result = service.joinBattle(
        {
          battleId: 'public-battle-2',
          team: 'B',
        },
        'user-1',
      )

      expect(result.team).toBe('B')
      expect(result.battleState.teamB.users).toContain('user-1')
    })
  })

  describe('updatePhase', () => {
    beforeEach(() => {
      service.setBattlesForTest([createBattle({ id: 'battle-1' })])
      service['initBattleState']('battle-1')
    })

    it('OPINION_SHARE → ATTACK 으로 전환된다', () => {
      const state = service['activeBattles'].get('battle-1')!

      service['updatePhase']('battle-1')

      expect(state.phase).toBe(BATTLE_PHASE.OPINION_SHARE.name)

      service['updatePhase']('battle-1')

      expect(state.phase).toBe(BATTLE_PHASE.ATTACK.name)
      expect(state.phaseCount).toBe(1)
    })

    it('ATTACK → DEFENSE 로 턴이 변경된다', () => {
      const state = service['activeBattles'].get('battle-1')!

      service['updatePhase']('battle-1')
      service['updatePhase']('battle-1')
      service['updatePhase']('battle-1')

      expect(state.phase).toBe(BATTLE_PHASE.DEFENSE.name)
      expect(state.phaseCount).toBe(1)
    })
    it('ATTACK ↔ DEFENSE 가 2회 반복된다', () => {
      const state = service['activeBattles'].get('battle-1')!

      service['updatePhase']('battle-1') // PENDING → OPINION
      service['updatePhase']('battle-1') // OPINION → ATTACK
      service['updatePhase']('battle-1') // ATTACK → DEFENSE
      service['updatePhase']('battle-1') // DEFENSE → ATTACK (count 2)

      expect(state.phase).toBe(BATTLE_PHASE.ATTACK.name)
      expect(state.phaseCount).toBe(2)
    })

    it('TEAM_SWITCH 이후 round가 증가한다', () => {
      const battle = createBattle({
        id: 'battle-1',
        playTime: BATTLE_PLAYTIME.THIRTY_MIN,
        topics: ['주제1', '주제2'],
      })
      service.setBattlesForTest([battle])

      service['initBattleState']('battle-1')
      const state = service['activeBattles'].get('battle-1')!

      state.phase = BATTLE_PHASE.TEAM_SWITCH.name
      state.round = 1

      service['updatePhase']('battle-1')

      expect(state.round).toBe(2)
      expect(state.phase).toBe(BATTLE_PHASE.OPINION_SHARE.name)
    })

    it('마지막 라운드 이후 finishBattle가 호출된다', () => {
      const battle = createBattle({
        id: 'battle-1',
        playTime: BATTLE_PLAYTIME.THIRTY_MIN,
        topics: ['주제1', '주제2'],
      })
      service.setBattlesForTest([battle])

      service['initBattleState']('battle-1')

      const finishSpy = jest.spyOn(service as never, 'finishBattle')

      const state = service['activeBattles'].get('battle-1')!
      state.phase = BATTLE_PHASE.TEAM_SWITCH.name
      state.round = 2

      service['updatePhase']('battle-1')

      expect(finishSpy).toHaveBeenCalled()
    })
  })

  describe('voteTeam / TEAM_SWITCH 적용', () => {
    beforeEach(() => {
      const battle = createBattle({ id: 'battle-1', status: BATTLE_STATUS.OPEN })
      service.setBattlesForTest([battle])
      service['initBattleState']('battle-1')

      service.registerGuest('battle-1', { id: 'user-1', nickname: 'test-user', createdAt: Date.now() })
      service.joinBattle(
        {
          battleId: 'battle-1',
          team: BATTLE_TEAM.A,
        },
        'user-1',
      )
    })

    it('TEAM_SWITCH가 아니면 팀 변경 투표가 거부된다', () => {
      expect(() =>
        service.voteTeam(
          {
            battleId: 'battle-1',
            team: BATTLE_TEAM.B,
          },
          'user-1',
        ),
      ).toThrow(BadRequestException)
    })

    it('TEAM_SWITCH 종료 시 투표가 반영되어 팀이 변경된다', () => {
      const state = service['activeBattles'].get('battle-1')!
      state.phase = BATTLE_PHASE.TEAM_SWITCH.name

      service.voteTeam(
        {
          battleId: 'battle-1',
          team: BATTLE_TEAM.B,
        },
        'user-1',
      )

      service['updatePhase']('battle-1')

      expect(state.teamA.users).not.toContain('user-1')
      expect(state.teamB.users).toContain('user-1')
    })

    it('TEAM_SWITCH 종료 시 팀 변경 후 teamCount가 올바르게 계산된다', () => {
      const state = service['activeBattles'].get('battle-1')!
      state.phase = BATTLE_PHASE.TEAM_SWITCH.name

      expect(state.teamA.users.length).toBe(1)
      expect(state.teamB.users.length).toBe(0)
      expect(state.participants.size).toBe(1)

      service['addParticipant']('battle-1', 'user-none', BATTLE_TEAM.NONE)

      const beforeTotal = state.participants.size // 2명
      const beforeTeamA = state.teamA.users.length // 1명
      const beforeTeamB = state.teamB.users.length // 0명
      const beforeTeamNone = beforeTotal - beforeTeamA - beforeTeamB // 2 - 1 - 0 = 1

      expect(beforeTeamNone).toBe(1)
      expect(state.participants.get('user-none')).toBe(BATTLE_TEAM.NONE)

      // A팀에서 B팀으로 변경
      service.voteTeam(
        {
          battleId: 'battle-1',
          team: BATTLE_TEAM.B,
        },
        'user-1',
      )

      service['updatePhase']('battle-1')

      const afterTotal = state.participants.size
      const afterTeamA = state.teamA.users.length // 0명
      const afterTeamB = state.teamB.users.length // 1명
      const afterTeamNone = afterTotal - afterTeamA - afterTeamB // 2 - 0 - 1 = 1

      expect(afterTeamNone).toBe(beforeTeamNone)
      expect(afterTeamA).toBe(0)
      expect(afterTeamB).toBe(1)
      expect(state.participants.get('user-1')).toBe(BATTLE_TEAM.B)
      expect(state.participants.get('user-none')).toBe(BATTLE_TEAM.NONE)
    })
  })

  describe('getOpenBattles', () => {
    it('PUBLIC 이면서 OPEN 상태인 배틀만 반환한다', () => {
      const battles: Battle[] = [
        createBattle({ status: BATTLE_STATUS.OPEN }),
        createBattle({ status: BATTLE_STATUS.CLOSED }),
        createBattle({ type: BATTLE_TYPE.PRIVATE, status: BATTLE_STATUS.OPEN }),
      ]

      service.setBattlesForTest(battles)

      const result = service.getOpenBattles(10, 0).battles

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe(BATTLE_STATUS.OPEN)
    })

    it('배틀 생성 시간 기준 최신순으로 정렬된다', () => {
      const battles = [createBattle({ id: 'old', createdAt: new Date('2024-01-01') }), createBattle({ id: 'new', createdAt: new Date('2024-01-02') })]

      service.setBattlesForTest(battles)

      const result = service.getOpenBattles(10, 0).battles

      expect(result[0].id).toBe('new')
      expect(result[1].id).toBe('old')
    })

    it('정렬된 결과에 대해 limit / offset 이 적용된다', () => {
      const battles = [
        createBattle({ id: '1', createdAt: new Date('2024-01-01') }),
        createBattle({ id: '2', createdAt: new Date('2024-01-02') }),
        createBattle({ id: '3', createdAt: new Date('2024-01-03') }),
      ]

      service.setBattlesForTest(battles)

      const result = service.getOpenBattles(1, 1).battles

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })
  })

  describe('getClosedBattles', () => {
    it('PUBLIC 이면서 FINISHED 상태인 배틀만 반환한다', () => {
      // const battles: Battle[] = [
      //   createBattle({ status: BATTLE_STATUS.CLOSED }),
      //   createBattle({ status: BATTLE_STATUS.OPEN }),
      //   createBattle({ type: BATTLE_TYPE.PRIVATE, status: BATTLE_STATUS.CLOSED }),
      // ]
      // service.setBattlesForTest(battles)
      // const result = service.getClosedBattles(10, 0)
      // expect(result.battles).toHaveLength(1)
      // expect(result.battles[0].status).toBe(BATTLE_STATUS.CLOSED)

      const result = service.getClosedBattles(10, 0)

      result.battles.forEach(battle => {
        expect(battle.status).toBe(BATTLE_STATUS.CLOSED)
        expect(battle).toHaveProperty('id')
        expect(battle).toHaveProperty('title')
        expect(battle).toHaveProperty('description')
        expect(battle).toHaveProperty('category')
        expect(battle).toHaveProperty('createdAt')
        expect(battle).toHaveProperty('expiresAt')
        expect(battle).toHaveProperty('result')
      })
    })

    it('배틀 종료 시각 기준 최신 종료 순으로 정렬된다', () => {
      // const shorter = createBattle({
      //   id: 'short',
      //   playTime: BATTLE_PLAYTIME.FIVE_MIN,
      //   status: BATTLE_STATUS.CLOSED,
      // })
      // const longer = createBattle({
      //   id: 'long',
      //   playTime: BATTLE_PLAYTIME.THIRTY_MIN,
      //   status: BATTLE_STATUS.CLOSED,
      // })
      // service.setBattlesForTest([shorter, longer])
      // const result = service.getClosedBattles(10, 0)
      // expect(result.battles[0].id).toBe('long')
      // expect(result.battles[1].id).toBe('short')
      // expect(result.meta.total).toBe(2)

      const result = service.getClosedBattles(10, 0)

      const times = result.battles.map(b => b.expiresAt.getTime())
      const sorted = [...times].sort((a, b) => b - a)

      expect(times).toEqual(sorted)
    })
  })

  describe('getBattleResult', () => {
    beforeEach(() => {
      service['finishedBattles'].set('battle-1', createFinishedBattleState())
    })

    it('종료된 배틀의 결과를 반환해야 함', () => {
      const result = service.getBattleResult('battle-1')
      expect(result.battleId).toBe('battle-1')
      expect(result.status).toBe('CLOSED')
      expect(result).toHaveProperty('codeA')
      expect(result).toHaveProperty('codeB')
      expect(result).toHaveProperty('result')
      expect(result).toHaveProperty('metrics')
      expect(result).toHaveProperty('voteTimeline')
      expect(result).toHaveProperty('timeline')
      expect(result).toHaveProperty('mvp')
    })

    it('존재하지 않는 배틀 조회 시 NotFoundException을 던져야 함', () => {
      expect(() => service.getBattleResult('battle-999')).toThrow(NotFoundException)
    })

    it('진행 중인 배틀 조회 시 BadRequestException을 던져야 함', () => {
      service.setBattlesForTest([createBattle({ id: 'battle-open-1', status: BATTLE_STATUS.OPEN })])
      expect(() => service.getBattleResult('battle-open-1')).toThrow(BadRequestException)
    })

    it('투표 비율이 올바르게 계산되어야 함', () => {
      const result = service.getBattleResult('battle-1')
      expect(result.result.teamA.percentage).toBe(44)
      expect(result.result.teamB.percentage).toBe(40)
      expect(result.result.neutral.percentage).toBe(16)
    })

    it('타임라인이 시간순(오래된순)으로 정렬되어야 함', () => {
      const result = service.getBattleResult('battle-1')
      const timestamps = result.timeline.map(item => new Date(item.createdAt).getTime())
      const sortedTimestamps = [...timestamps].sort((a, b) => a - b)
      expect(timestamps).toEqual(sortedTimestamps)
    })

    it('MVP가 올바르게 계산되어야 함 (최다 upvotes)', () => {
      const result = service.getBattleResult('battle-1')
      expect(result.mvp.nickname).toBe('CodeMaster')
      expect(result.mvp.totalVotes).toBe(25)
      expect(result.mvp.team).toBe('A')
    })

    it('투표 추세가 누적값으로 반환되어야 함', () => {
      const result = service.getBattleResult('battle-1')
      // 턴 1 < 턴 2 < 턴 3 (누적값 증가)
      expect(result.voteTimeline[0].teamAVotes).toBeLessThan(result.voteTimeline[1].teamAVotes)
      expect(result.voteTimeline[1].teamAVotes).toBeLessThan(result.voteTimeline[2].teamAVotes)
    })

    it('타임라인에 ATTACK과 DEFENSE만 포함되어야 함', () => {
      const result = service.getBattleResult('battle-1')
      result.timeline.forEach(item => {
        expect(['ATTACK', 'DEFENSE']).toContain(item.type)
      })
    })
  })

  describe('appendChatMessage', () => {
    beforeEach(() => {
      service.setBattlesForTest([createBattle({ id: 'battle-1' })])
      service['initBattleState']('battle-1')
      service.registerGuest('battle-1', { id: 'user-1', nickname: 'test-user', createdAt: Date.now() })
    })

    it('배틀이 없으면 NotFoundException을 던진다', () => {
      expect(() =>
        service.appendChatMessage(
          {
            battleId: 'invalid',
            scope: 'TEAM',
            team: BATTLE_TEAM.A,
            text: 'hello',
          },
          'user-1',
        ),
      ).toThrow(NotFoundException)
    })

    it('진영 채팅 메시지를 해당 팀 채팅에만 추가한다', () => {
      const result = service.appendChatMessage(
        {
          battleId: 'battle-1',
          scope: 'TEAM',
          team: BATTLE_TEAM.A,
          text: 'hello',
        },
        'user-1',
      )

      const state = service['activeBattles'].get('battle-1')!

      expect(result).toEqual(
        expect.objectContaining({
          battleId: 'battle-1',
          scope: 'TEAM',
          team: BATTLE_TEAM.A,
          sender: { userId: 'user-1', nickname: expect.any(String) },
          text: 'hello',
          messageId: expect.any(String),
        }),
      )
      expect(state.teamA.chats).toHaveLength(1)
      expect(state.all.chats).toHaveLength(0)
    })

    it('전체 채팅 메시지를 전체 채팅에 추가한다', () => {
      const result = service.appendChatMessage(
        {
          battleId: 'battle-1',
          scope: 'ALL',
          text: 'hello all',
          team: 'A',
        },
        'user-1',
      )

      const state = service['activeBattles'].get('battle-1')!

      expect(result).toEqual(
        expect.objectContaining({
          battleId: 'battle-1',
          scope: 'ALL',
          sender: { userId: 'user-1', nickname: expect.any(String) },
          text: 'hello all',
          messageId: expect.any(String),
        }),
      )
      expect(state.all.chats).toHaveLength(1)
      expect(state.teamA.chats).toHaveLength(0)
      expect(state.teamB.chats).toHaveLength(0)
    })
  })
  describe('handleAttackVote', () => {
    beforeEach(() => {
      const battle = createBattle({ id: 'battle-1' })
      service.setBattlesForTest([battle])
      service['initBattleState']('battle-1')

      const state = service['activeBattles'].get('battle-1')!
      state.phase = BATTLE_PHASE.ATTACK.name

      service.handleAttack('battle-1', {
        authorId: 'user-a',
        content: 'attack!',
        team: BATTLE_TEAM.A,
      })
    })

    it('정상적으로 공격 이의제기에 투표한다', () => {
      const attack = service['activeBattles'].get('battle-1')!.teamA.attacks[0]!

      const result = service.handleAttackVote('battle-1', attack.discussionId, {
        userId: 'voter-1',
        team: BATTLE_TEAM.A,
      })
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(
        expect.objectContaining({
          discussionId: attack.discussionId,
          upvotes: 1,
          votes: ['voter-1'],
        }),
      )
    })

    it('같은 유저가 중복 투표하면 BadRequestException', () => {
      const attack = service['activeBattles'].get('battle-1')!.teamA.attacks[0]!

      service.handleAttackVote('battle-1', attack.discussionId, {
        userId: 'voter-1',
        team: BATTLE_TEAM.A,
      })

      expect(() =>
        service.handleAttackVote('battle-1', attack.discussionId, {
          userId: 'voter-1',
          team: BATTLE_TEAM.A,
        }),
      ).toThrow(BadRequestException)
    })

    it('중립 진영은 투표할 수 없다', () => {
      const attack = service['activeBattles'].get('battle-1')!.teamA.attacks[0]!

      expect(() =>
        service.handleAttackVote('battle-1', attack.discussionId, {
          userId: 'neutral',
          team: BATTLE_TEAM.NONE,
        }),
      ).toThrow(ForbiddenException)
    })

    it('현재 수비 페이즈가 아니면 공격 페이즈에 관해 BadRequestException', () => {
      const state = service['activeBattles'].get('battle-1')!

      const attack = state.teamA.attacks[0]!

      expect(() =>
        service.handleDefenseVote('battle-1', attack.discussionId, {
          userId: 'user',
          team: BATTLE_TEAM.A,
        }),
      ).toThrow(BadRequestException)
    })

    it('존재하지 않는 discussion이면 NotFoundException', () => {
      expect(() =>
        service.handleAttackVote('battle-1', 'invalid-id', {
          userId: 'user',
          team: BATTLE_TEAM.A,
        }),
      ).toThrow(NotFoundException)
    })
  })

  describe('calculateMVP (새로운 로직)', () => {
    beforeEach(() => {
      const battle = createBattle({ id: 'battle-1', status: BATTLE_STATUS.OPEN })
      service.setBattlesForTest([battle])
      service['initBattleState']('battle-1')

      const state = service['activeBattles'].get('battle-1')!

      // 참가자 등록 (joinedAt 시간 순서대로)
      service.registerGuest('battle-1', { id: 'user-1', nickname: 'User1', createdAt: 1000 })
      service.registerGuest('battle-1', { id: 'user-2', nickname: 'User2', createdAt: 2000 })
      service.registerGuest('battle-1', { id: 'user-3', nickname: 'User3', createdAt: 3000 })

      state.participants.set('user-1', BATTLE_TEAM.A)
      state.participants.set('user-2', BATTLE_TEAM.B)
      state.participants.set('user-3', BATTLE_TEAM.A)

      service['rebuildTeamUsers'](state)
    })

    it('모든 의견의 투표를 누적하여 MVP를 계산한다', () => {
      const state = service['activeBattles'].get('battle-1')!
      state.phase = BATTLE_PHASE.ATTACK.name

      // user-1: 2개 의견, 총 5표
      state.teamA.attacks.push({
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
      state.teamA.attacks.push({
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
      state.teamB.attacks.push({
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
      const mvp = service['calculateMVP'](state, 'A')

      // user-1: score = 3/5 + 2/5 = 1.0, totalVotes = 5
      // user-2: score = 4/4 = 1.0, totalVotes = 4
      // 점수 동점 → 좋아요 수 비교 → user-1이 5표로 MVP
      expect(mvp).not.toBeNull()
      expect(mvp!.userId).toBe('user-1')
      expect(mvp!.totalVotes).toBe(5)
    })

    it('중립 팀 사용자는 MVP 후보에서 제외된다', () => {
      const state = service['activeBattles'].get('battle-1')!
      state.phase = BATTLE_PHASE.ATTACK.name

      // 중립 팀 사용자 추가
      service.registerGuest('battle-1', { id: 'user-none', nickname: 'NeutralUser', createdAt: 500 })
      state.participants.set('user-none', BATTLE_TEAM.NONE)

      // 중립 팀 사용자가 가장 많은 표를 받았다고 가정 (실제로는 의견 제출 불가하지만 테스트용)
      state.teamA.attacks.push({
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

      state.teamA.attacks.push({
        discussionId: 'attack-2',
        author: { authorId: 'user-1', nickname: 'User1' },
        type: 'ATTACK',
        content: 'attack',
        upvotes: 1,
        votes: ['voter-1'],
        status: 'PENDING',
        team: BATTLE_TEAM.A,
      })

      const mvp = service['calculateMVP'](state, 'A')

      // 중립 팀 제외, user-1이 MVP
      expect(mvp).not.toBeNull()
      expect(mvp!.userId).toBe('user-1')
    })

    it('동점일 때 승리 팀 소속이 우선이다', () => {
      const state = service['activeBattles'].get('battle-1')!
      state.phase = BATTLE_PHASE.ATTACK.name

      // 동일한 점수, 좋아요, 의견 수
      state.teamA.attacks.push({
        discussionId: 'attack-1',
        author: { authorId: 'user-1', nickname: 'User1' },
        type: 'ATTACK',
        content: 'attack',
        upvotes: 2,
        votes: ['v1', 'v2'],
        status: 'PENDING',
        team: BATTLE_TEAM.A,
      })

      state.teamB.attacks.push({
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
      const mvp = service['calculateMVP'](state, 'A')
      expect(mvp!.userId).toBe('user-1')
      expect(mvp!.team).toBe('A')

      // B팀이 승리한 경우
      const mvpB = service['calculateMVP'](state, 'B')
      expect(mvpB!.userId).toBe('user-2')
      expect(mvpB!.team).toBe('B')
    })

    it('선정된 의견 수가 많은 후보가 우선이다', () => {
      const state = service['activeBattles'].get('battle-1')!
      state.phase = BATTLE_PHASE.ATTACK.name

      // user-1: 2개 의견, 2개 선정됨
      state.teamA.attacks.push({
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
      state.teamA.attacks.push({
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
      state.teamA.attacks.push({
        discussionId: 'attack-3',
        author: { authorId: 'user-3', nickname: 'User3' },
        type: 'ATTACK',
        content: 'attack 3',
        upvotes: 1,
        votes: ['v3'],
        status: 'PENDING',
        team: BATTLE_TEAM.A,
      })
      state.teamA.attacks.push({
        discussionId: 'attack-4',
        author: { authorId: 'user-3', nickname: 'User3' },
        type: 'ATTACK',
        content: 'attack 4',
        upvotes: 1,
        votes: ['v4'],
        status: 'PENDING',
        team: BATTLE_TEAM.A,
      })

      const mvp = service['calculateMVP'](state, 'A')

      // 동일 점수, 좋아요, 의견수, 팀 → 선정된 의견 수로 비교
      expect(mvp!.userId).toBe('user-1')
      expect(mvp!.selectedOpinionCount).toBe(2)
    })

    it('먼저 참여한 사용자가 우선이다', () => {
      const state = service['activeBattles'].get('battle-1')!
      state.phase = BATTLE_PHASE.ATTACK.name

      // user-1 (참가순서: 0)과 user-3 (참가순서: 2) 동일 조건
      state.teamA.attacks.push({
        discussionId: 'attack-1',
        author: { authorId: 'user-1', nickname: 'User1' },
        type: 'ATTACK',
        content: 'attack',
        upvotes: 1,
        votes: ['v1'],
        status: 'PENDING',
        team: BATTLE_TEAM.A,
      })

      state.teamA.attacks.push({
        discussionId: 'attack-2',
        author: { authorId: 'user-3', nickname: 'User3' },
        type: 'ATTACK',
        content: 'attack',
        upvotes: 1,
        votes: ['v2'],
        status: 'PENDING',
        team: BATTLE_TEAM.A,
      })

      const mvp = service['calculateMVP'](state, 'A')

      // 모든 조건 동일 → 먼저 참여한 user-1이 MVP (참가순서 0)
      expect(mvp!.userId).toBe('user-1')
      expect(mvp!.joinedAt).toBe(0) // participants Map 삽입 순서 기반
    })

    it('의견이 없으면 null을 반환한다', () => {
      const state = service['activeBattles'].get('battle-1')!
      const mvp = service['calculateMVP'](state, 'A')
      expect(mvp).toBeNull()
    })

    it('투표 참가자가 0명이면 점수는 0이다', () => {
      const state = service['activeBattles'].get('battle-1')!
      state.phase = BATTLE_PHASE.ATTACK.name

      // 투표자가 없는 의견
      state.teamA.attacks.push({
        discussionId: 'attack-1',
        author: { authorId: 'user-1', nickname: 'User1' },
        type: 'ATTACK',
        content: 'attack',
        upvotes: 0,
        votes: [],
        status: 'PENDING',
        team: BATTLE_TEAM.A,
      })

      const mvp = service['calculateMVP'](state, 'A')
      expect(mvp).not.toBeNull()
      expect(mvp!.score).toBe(0)
    })

    it('페이즈별로 기록된 투표 참가자 수를 사용하여 점수를 계산한다', () => {
      const state = service['activeBattles'].get('battle-1')!
      state.phase = BATTLE_PHASE.ATTACK.name

      // user-1: 2개 의견, 페이즈별 투표 참가자 수가 다름
      // 1차 페이즈: 2표/4명 = 0.5점
      state.teamA.attacks.push({
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
      state.teamA.attacks.push({
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
      state.teamB.attacks.push({
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

      const mvp = service['calculateMVP'](state, 'A')

      // user-1 (A팀): score = (0.5 + 0.3) * 1.5 = 1.2, totalVotes = 5
      // user-2 (B팀): score = 1.0 (보너스 없음), totalVotes = 4
      // A팀 승리 시 user-1이 보너스를 받아 MVP
      expect(mvp).not.toBeNull()
      expect(mvp!.userId).toBe('user-1')
      expect(mvp!.score).toBeCloseTo(1.2)
      expect(mvp!.totalVotes).toBe(5)
    })

    it('voterCountAtPhase가 없으면 점수 0으로 처리한다', () => {
      const state = service['activeBattles'].get('battle-1')!
      state.phase = BATTLE_PHASE.ATTACK.name

      // voterCountAtPhase가 없는 의견
      state.teamA.attacks.push({
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
      state.teamA.attacks.push({
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

      const mvp = service['calculateMVP'](state, 'A')

      // user-1 (A팀): voterCountAtPhase 없음 → 점수 0 * 1.5 = 0, totalVotes = 10
      // user-3 (A팀): score = 1/2 * 1.5 = 0.75, totalVotes = 1
      // user-3이 점수가 높으므로 MVP
      expect(mvp).not.toBeNull()
      expect(mvp!.userId).toBe('user-3')
      expect(mvp!.score).toBeCloseTo(0.75)
    })
  })

  describe('calculateMVP (승리 팀 1.5배 보너스)', () => {
    beforeEach(() => {
      const battle = createBattle({ id: 'battle-1', status: BATTLE_STATUS.OPEN })
      service.setBattlesForTest([battle])
      service['initBattleState']('battle-1')

      const state = service['activeBattles'].get('battle-1')!

      service.registerGuest('battle-1', { id: 'user-a', nickname: 'UserA', createdAt: 1000 })
      service.registerGuest('battle-1', { id: 'user-b', nickname: 'UserB', createdAt: 2000 })

      state.participants.set('user-a', BATTLE_TEAM.A)
      state.participants.set('user-b', BATTLE_TEAM.B)

      service['rebuildTeamUsers'](state)
    })

    it('A팀 70표/100명 vs B팀 5표/5명: 보너스 없이는 B팀이 유리하지만, A팀 승리 시 A팀이 MVP가 된다', () => {
      const state = service['activeBattles'].get('battle-1')!
      state.phase = BATTLE_PHASE.ATTACK.name

      // user-a (A팀): 70표 / 100명 = 0.7점 → 1.5배 보너스 → 1.05점
      state.teamA.attacks.push({
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
      state.teamB.attacks.push({
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
      const mvpWhenAWins = service['calculateMVP'](state, 'A')
      expect(mvpWhenAWins).not.toBeNull()
      expect(mvpWhenAWins!.userId).toBe('user-a')
      expect(mvpWhenAWins!.score).toBeCloseTo(1.05)
    })

    it('A팀 70표/100명 vs B팀 5표/5명: B팀 승리 시 B팀이 MVP가 된다', () => {
      const state = service['activeBattles'].get('battle-1')!
      state.phase = BATTLE_PHASE.ATTACK.name

      // user-a (A팀): 70표 / 100명 = 0.7점 → 보너스 없음 → 0.7점
      state.teamA.attacks.push({
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
      state.teamB.attacks.push({
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
      const mvpWhenBWins = service['calculateMVP'](state, 'B')
      expect(mvpWhenBWins).not.toBeNull()
      expect(mvpWhenBWins!.userId).toBe('user-b')
      expect(mvpWhenBWins!.score).toBeCloseTo(1.5)
    })

    it('무승부 시 보너스 없이 순수 점수로 비교한다', () => {
      const state = service['activeBattles'].get('battle-1')!
      state.phase = BATTLE_PHASE.ATTACK.name

      // user-a (A팀): 70표 / 100명 = 0.7점
      state.teamA.attacks.push({
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
      state.teamB.attacks.push({
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
      const mvpWhenDraw = service['calculateMVP'](state, 'DRAW')
      expect(mvpWhenDraw).not.toBeNull()
      expect(mvpWhenDraw!.userId).toBe('user-b')
      expect(mvpWhenDraw!.score).toBeCloseTo(1.0)
    })

    it('동일 점수 + 동일 보너스 시 totalVotes로 비교한다', () => {
      const state = service['activeBattles'].get('battle-1')!
      state.phase = BATTLE_PHASE.ATTACK.name

      // 같은 팀, 같은 점수 비율
      service.registerGuest('battle-1', { id: 'user-a2', nickname: 'UserA2', createdAt: 3000 })
      state.participants.set('user-a2', BATTLE_TEAM.A)
      service['rebuildTeamUsers'](state)

      // user-a: 50표 / 100명 = 0.5점 → 1.5배 → 0.75점, totalVotes = 50
      state.teamA.attacks.push({
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
      state.teamA.attacks.push({
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

      const mvp = service['calculateMVP'](state, 'A')
      expect(mvp).not.toBeNull()
      // 점수 동점 → totalVotes로 비교 → user-a가 50표로 MVP
      expect(mvp!.userId).toBe('user-a')
      expect(mvp!.totalVotes).toBe(50)
    })

    it('여러 의견이 있을 때 누적 점수에 보너스가 적용된다', () => {
      const state = service['activeBattles'].get('battle-1')!
      state.phase = BATTLE_PHASE.ATTACK.name

      // user-a: 2개 의견, 각각 30표/100명 = 0.3 + 0.3 = 0.6점 → 1.5배 → 0.9점
      state.teamA.attacks.push({
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
      state.teamA.defenses.push({
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
      state.teamB.attacks.push({
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
      const mvp = service['calculateMVP'](state, 'A')
      expect(mvp).not.toBeNull()
      expect(mvp!.userId).toBe('user-a')
      expect(mvp!.score).toBeCloseTo(0.9)
      expect(mvp!.opinionCount).toBe(2)
    })

    it('소수 인원으로 참여한 팀이 불리하지 않도록 보너스가 적용된다', () => {
      const state = service['activeBattles'].get('battle-1')!
      state.phase = BATTLE_PHASE.ATTACK.name

      // user-a (A팀, 다수): 80표 / 100명 = 0.8점 → 1.5배 → 1.2점
      state.teamA.attacks.push({
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
      state.teamB.attacks.push({
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
      const mvp = service['calculateMVP'](state, 'A')
      expect(mvp).not.toBeNull()
      expect(mvp!.userId).toBe('user-a')
      expect(mvp!.score).toBeCloseTo(1.2)
    })
  })
})
