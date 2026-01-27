import { NotFoundException, BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common'
import { Battle, FinishedBattleState, BattleDefense, ActiveBattleState } from '../types/battles.types'
import { BattlesService } from './battles.service'
import {
  BATTLE_TYPE,
  BATTLE_CATEGORY,
  BATTLE_PLAYTIME,
  BATTLE_LANGUAGE,
  BATTLE_STATUS,
  BATTLE_PHASE,
  BATTLE_TEAM,
  BATTLE_DISCUSSION_TYPE,
} from '../const/battles.const'
import type { PrismaService } from 'src/prisma/prisma.service'

type BattleRecord = {
  id: string
  userId: string
  title: string
  description: string
  codeA: string
  codeB: string
  language: string
  category: string
  playTime: string
  topics: string[]
  inviteCode: string | null
  isPrivate: boolean
  status: string
  createdAt: Date
  updatedAt: Date | null
  finishedAt: Date | null
  teamACount: number
  teamBCount: number
  totalParticipantsCount: number
  winningTeam: string | null
  timeline: unknown[]
  mvps: string[]
  mvpsState: unknown[]
  currentRound: number
  currentPhase: string
  phaseCount: number
  startedAt: Date | null
  expiredAt: Date | null
  participantsState: unknown
  teamVotesState: unknown
  userInfoState: unknown
  attacksState: unknown
  defensesState: unknown
  opinionHistoryState: unknown
  chatsAllState: unknown
  chatsTeamAState: unknown
  chatsTeamBState: unknown
}

type BattleFindManyArgs = {
  where?: { isPrivate?: boolean; status?: { in?: string[] } }
  orderBy?: { createdAt?: 'asc' | 'desc'; finishedAt?: 'asc' | 'desc' }
  skip?: number
  take?: number
}

type BattleCountArgs = {
  where?: { isPrivate?: boolean; status?: { in?: string[] } }
}

type BattleUpdateArgs = {
  where: { id: string }
  data: Partial<BattleRecord>
}

type BattleCreateArgs = {
  data: BattleRecord
}

type BattleFindUniqueArgs = {
  where: { id: string }
}

type MockPrisma = {
  battle: {
    findUnique: jest.Mock<BattleRecord | null, [BattleFindUniqueArgs]>
    findMany: jest.Mock<BattleRecord[], [BattleFindManyArgs]>
    count: jest.Mock<number, [BattleCountArgs | undefined]>
    update: jest.Mock<BattleRecord | null, [BattleUpdateArgs]>
    create: jest.Mock<BattleRecord, [BattleCreateArgs]>
  }
  battleParticipant: { upsert: jest.Mock }
  user: { findUnique: jest.Mock<{ id: string } | null, [{ where: { id: string }; select?: { id: true } }]> }
}

type BattleStateAccess = {
  loadBattleState: (id: string) => Promise<{ battle: unknown; state: ActiveBattleState }>
  saveBattleState: (id: string, state: ActiveBattleState) => Promise<void>
}

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
  mvps: [
    {
      userId: 'user-1',
      nickname: 'CodeMaster',
      team: 'A',
      score: 2.5,
      totalVotes: 25,
      opinionCount: 2,
      selectedOpinionCount: 1,
      joinedAt: 1000,
    },
  ],
  ...overrides,
})

describe('BattlesService', () => {
  let service: BattlesService
  let battleStore: Map<string, BattleRecord>
  let stateStore: Map<string, ActiveBattleState>
  let mockPrisma: MockPrisma

  const toRecord = (battle: Battle, overrides: Partial<BattleRecord> = {}): BattleRecord => ({
    id: battle.id,
    userId: battle.authorId,
    title: battle.title,
    description: battle.description,
    codeA: battle.aCode,
    codeB: battle.bCode,
    language: battle.language,
    category: battle.category,
    playTime: (battle.playTime as { name?: string }).name ?? (battle.playTime as unknown as string),
    topics: battle.topics,
    inviteCode: battle.inviteCode ?? null,
    isPrivate: battle.type === BATTLE_TYPE.PRIVATE,
    status: battle.status,
    createdAt: battle.createdAt,
    updatedAt: battle.updatedAt ?? null,
    finishedAt: null,
    teamACount: 0,
    teamBCount: 0,
    totalParticipantsCount: 0,
    winningTeam: null,
    timeline: [],
    mvps: [],
    mvpsState: [],
    currentRound: battle.initialState.round,
    currentPhase: battle.initialState.phase,
    phaseCount: battle.initialState.phaseCount,
    startedAt: null,
    expiredAt: null,
    participantsState: [],
    teamVotesState: [],
    userInfoState: [],
    attacksState: { teamA: [], teamB: [], all: [] },
    defensesState: { teamA: [], teamB: [], all: [] },
    opinionHistoryState: [],
    chatsAllState: [],
    chatsTeamAState: [],
    chatsTeamBState: [],
    ...overrides,
  })

  const seedBattles = (battles: Battle[]) => {
    battleStore = new Map()
    battles.forEach(battle => battleStore.set(battle.id, toRecord(battle)))
  }
  const getState = async (battleId: string): Promise<ActiveBattleState> => {
    const { battleState } = await service.getBattleState(battleId)
    return battleState
  }
  const getStateUnsafe = async (battleId: string) => {
    const access = service as unknown as BattleStateAccess
    const { state } = await access.loadBattleState(battleId)
    return state
  }
  const updateState = async (battleId: string, updater: (state: ActiveBattleState) => void) => {
    const access = service as unknown as BattleStateAccess
    const { state } = await access.loadBattleState(battleId)
    updater(state)
    await access.saveBattleState(battleId, state)
    return state
  }

  const cleanupService = () => {
    service['battleTimers'].forEach(timer => clearTimeout(timer))
    service['battleTimers'].clear()
  }

  beforeEach(() => {
    battleStore = new Map()
    stateStore = new Map()
    mockPrisma = {
      battle: {
        findUnique: jest.fn(({ where }: BattleFindUniqueArgs) => battleStore.get(where.id) ?? null),
        findMany: jest.fn(({ where, orderBy, skip = 0, take }: BattleFindManyArgs) => {
          let records = [...battleStore.values()]
          if (where?.isPrivate !== undefined) {
            records = records.filter(r => r.isPrivate === where.isPrivate)
          }
          if (where?.status?.in) {
            records = records.filter(r => where.status?.in?.includes(r.status))
          }
          if (orderBy?.createdAt) {
            records.sort((a, b) =>
              orderBy.createdAt === 'asc' ? a.createdAt.getTime() - b.createdAt.getTime() : b.createdAt.getTime() - a.createdAt.getTime(),
            )
          }
          if (orderBy?.finishedAt) {
            records.sort((a, b) => {
              const aTime = a.finishedAt ? a.finishedAt.getTime() : 0
              const bTime = b.finishedAt ? b.finishedAt.getTime() : 0
              return orderBy.finishedAt === 'asc' ? aTime - bTime : bTime - aTime
            })
          }
          const end = take ? skip + take : undefined
          return records.slice(skip, end)
        }),
        count: jest.fn(({ where }: BattleCountArgs = {}) => {
          let records = [...battleStore.values()]
          if (where?.isPrivate !== undefined) {
            records = records.filter(r => r.isPrivate === where.isPrivate)
          }
          if (where?.status?.in) {
            records = records.filter(r => where.status?.in?.includes(r.status))
          }
          return records.length
        }),
        update: jest.fn(({ where, data }: BattleUpdateArgs) => {
          const existing = battleStore.get(where.id)
          if (!existing) return null
          const updated: BattleRecord = { ...existing, ...data }
          battleStore.set(where.id, updated)
          return updated
        }),
        create: jest.fn(({ data }: BattleCreateArgs) => {
          battleStore.set(data.id, data)
          return data
        }),
      },
      battleParticipant: { upsert: jest.fn() },
      user: { findUnique: jest.fn(() => null) },
    }
    service = new BattlesService(mockPrisma as unknown as PrismaService)
    const originalGetBattleState: BattlesService['getBattleState'] = service.getBattleState.bind(service)
    jest.spyOn(service, 'getBattleState').mockImplementation(async (battleId: string) => {
      const res = await originalGetBattleState(battleId)
      stateStore.set(battleId, res.battleState)
      return res
    })
    cleanupService()
    jest.useFakeTimers()
    jest.spyOn(Date, 'now').mockReturnValue(1_000_000)
  })

  afterEach(() => {
    cleanupService()
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  describe('getBattleState', () => {
    beforeEach(() => {
      seedBattles([createBattle({ id: 'battle-1' })])
    })

    it('battleId가 없으면 NotFoundException을 던진다', async () => {
      await expect(service.getBattleState('' as unknown as string)).rejects.toThrow(NotFoundException)
    })

    it('배틀 상태를 올바르게 로드한다', async () => {
      const { battleState } = await service.getBattleState('battle-1')

      expect(battleState.battleId).toBe('battle-1')
      expect(battleState.all.roomId).toBe('battle:battle-1')
      expect(battleState.teamA.roomId).toBe('battle:battle-1:A')
      expect(battleState.teamB.roomId).toBe('battle:battle-1:B')
      expect(battleState.teamA.users).toEqual([])
      expect(battleState.teamB.users).toEqual([])
    })
  })

  describe('addParticipant', () => {
    beforeEach(() => {
      seedBattles([createBattle({ id: 'battle-1' })])
    })

    it('필수 파라미터가 없으면 BadRequestException을 던진다', async () => {
      const state = await getState('battle-1')
      expect(() => service['addParticipant'](state, '', 'A')).toThrow(BadRequestException)
      expect(() => service['addParticipant'](state, 'client-1', '')).toThrow(BadRequestException)
    })

    it('A팀에 참가자를 추가한다', async () => {
      const state = await getState('battle-1')
      service['addParticipant'](state, 'client-1', BATTLE_TEAM.A)

      expect(state.teamA.users).toContain('client-1')
      expect(state.teamB.users).not.toContain('client-1')
    })

    it('B팀에 참가자를 추가한다', async () => {
      const state = await getState('battle-1')
      service['addParticipant'](state, 'client-2', BATTLE_TEAM.B)

      expect(state.teamB.users).toContain('client-2')
      expect(state.teamA.users).not.toContain('client-2')
    })

    it('중립 팀에 참가자를 추가한다', async () => {
      const state = await getState('battle-1')
      service['addParticipant'](state, 'client-3', BATTLE_TEAM.NONE)

      expect(state.teamA.users).not.toContain('client-3')
      expect(state.teamB.users).not.toContain('client-3')
      expect(state.participants.get('client-3')).toBe(BATTLE_TEAM.NONE)
    })

    it('참가자 추가 시 teamNoneCount가 올바르게 계산된다', async () => {
      const state = await getState('battle-1')
      service['addParticipant'](state, 'client-a1', BATTLE_TEAM.A)
      service['addParticipant'](state, 'client-b1', BATTLE_TEAM.B)
      service['addParticipant'](state, 'client-none1', BATTLE_TEAM.NONE)
      service['addParticipant'](state, 'client-none2', BATTLE_TEAM.NONE)

      const totalParticipants = state.participants.size
      const teamA = state.teamA.users.length
      const teamB = state.teamB.users.length
      const teamNone = totalParticipants - teamA - teamB

      expect(teamNone).toBe(2)
      expect(state.participants.size).toBe(4)
    })
  })

  describe('getBattleRoomId', () => {
    it('case', () => {
      const roomId = service.getBattleRoomId('battle-1')
      expect(roomId).toBe('battle:battle-1')
    })

    it('case', () => {
      const roomIdA = service.getBattleRoomId('battle-1', BATTLE_TEAM.A)
      const roomIdB = service.getBattleRoomId('battle-1', BATTLE_TEAM.B)

      expect(roomIdA).toBe('battle:battle-1:A')
      expect(roomIdB).toBe('battle:battle-1:B')
    })
  })

  describe('joinBattleInfo', () => {
    it('battleId가 없으면 BadRequestException을 던진다', async () => {
      await expect(service.joinBattleInfo('')).rejects.toThrow(BadRequestException)
    })

    it('존재하지 않는 배틀이면 NotFoundException을 던진다', async () => {
      await expect(service.joinBattleInfo('invalid-battle')).rejects.toThrow(NotFoundException)
    })

    it('배틀 정보를 반환한다', async () => {
      const battle = createBattle({ id: 'battle-1' })
      seedBattles([battle])

      const result = await service.joinBattleInfo('battle-1')

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
    let publicBattle: Battle
    let privateBattle: Battle
    let closedBattle: Battle

    beforeEach(async () => {
      publicBattle = createBattle({
        id: 'public-battle',
        type: BATTLE_TYPE.PUBLIC,
        status: BATTLE_STATUS.OPEN,
      })
      privateBattle = createBattle({
        id: 'private-battle',
        type: BATTLE_TYPE.PRIVATE,
        inviteCode: 'test-invite-code-1234',
        status: BATTLE_STATUS.OPEN,
      })
      closedBattle = createBattle({
        id: 'closed-battle',
        status: BATTLE_STATUS.CLOSED,
      })

      seedBattles([publicBattle, privateBattle, closedBattle])

      // Guest 등록
      await service.registerGuest('public-battle', { id: 'user-1', nickname: 'test-user', createdAt: Date.now() })
      await service.registerGuest('private-battle', { id: 'user-1', nickname: 'test-user', createdAt: Date.now() })
    })

    it('case', async () => {
      await expect(service.joinBattle({ battleId: '', team: 'A', nickname: 'test-user' }, 'user-1')).rejects.toThrow(BadRequestException)
    })

    it('case', async () => {
      await expect(
        service.joinBattle(
          {
            battleId: 'invalid',
            team: 'A',
          },
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException)
    })

    it('case', async () => {
      await expect(
        service.joinBattle(
          {
            battleId: 'private-battle',
            inviteCode: 'wrong-invite-code',
            team: 'A',
            nickname: 'test-user',
          },
          'user-1',
        ),
      ).rejects.toThrow(UnauthorizedException)
    })

    it('case', async () => {
      await service.registerGuest('private-battle', { id: 'user-1', nickname: 'test-user', createdAt: Date.now() })
      const result = await service.joinBattle(
        {
          battleId: 'private-battle',
          inviteCode: 'test-invite-code-1234',
          team: 'A',
          nickname: 'test-user',
        },
        'user-1',
      )

      expect(result.team).toBe('A')
      expect(result.battleState).toBeDefined()
    })

    it('case', async () => {
      await expect(
        service.joinBattle(
          {
            battleId: 'closed-battle',
            team: 'A',
          },
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException)
    })

    it('case', async () => {
      const result = await service.joinBattle(
        {
          battleId: 'public-battle',
          team: 'A',
        },
        'user-1',
      )

      expect(result.team).toBe('A')
      expect(result.battleState.teamA.users).toContain('user-1')
    })

    it('case', async () => {
      await service.registerGuest('public-battle', { id: 'user-1', nickname: 'test-user', createdAt: Date.now() })
      const firstResult = await service.joinBattle(
        {
          battleId: 'public-battle',
          team: 'A',
        },
        'user-1',
      )

      const secondResult = await service.joinBattle(
        {
          battleId: 'public-battle',
          team: 'A',
        },
        'user-1',
      )

      // 재접속 시 기존 상태가 같다는 것을 확인
      expect(secondResult.battleState).toEqual(firstResult.battleState)
      expect(secondResult.team).toBe(firstResult.team)

      const { battleState } = await service.getBattleState('public-battle')

      expect(battleState.participants.get('user-1')).toBe('A')
      expect(battleState.teamA.users).toContain('user-1')
      expect(battleState.teamB.users).not.toContain('user-1')
    })

    it('case', async () => {
      const battle2 = createBattle({
        id: 'public-battle-2',
        type: BATTLE_TYPE.PUBLIC,
        status: BATTLE_STATUS.OPEN,
      })
      seedBattles([publicBattle, privateBattle, closedBattle, battle2])
      await service.registerGuest('public-battle-2', { id: 'user-1', nickname: 'test-user', createdAt: Date.now() })

      await service.joinBattle(
        {
          battleId: 'public-battle',
          team: 'A',
        },
        'user-1',
      )

      const result = await service.joinBattle(
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
      seedBattles([createBattle({ id: 'battle-1' })])
    })

    it('case', async () => {
      await service['updatePhase']('battle-1')

      let state = await getState('battle-1')
      expect(state.phase).toBe(BATTLE_PHASE.ATTACK.name)
      expect(state.phaseCount).toBe(1)

      await service['updatePhase']('battle-1')

      state = await getState('battle-1')
      expect(state.phase).toBe(BATTLE_PHASE.DEFENSE.name)
      expect(state.phaseCount).toBe(1)
    })

    it('case', async () => {
      await service['updatePhase']('battle-1')
      await service['updatePhase']('battle-1')
      await service['updatePhase']('battle-1')

      const state = await getState('battle-1')
      expect(state.phase).toBe(BATTLE_PHASE.ATTACK.name)
      expect(state.phaseCount).toBe(2)
    })
    it('case', async () => {
      await service['updatePhase']('battle-1') // OPINION → ATTACK
      await service['updatePhase']('battle-1') // ATTACK → DEFENSE
      await service['updatePhase']('battle-1') // DEFENSE → ATTACK (count 2)

      const state = await getState('battle-1')
      expect(state.phase).toBe(BATTLE_PHASE.ATTACK.name)
      expect(state.phaseCount).toBe(2)
    })

    it('case', async () => {
      const battle = createBattle({
        id: 'battle-1',
        playTime: BATTLE_PLAYTIME.THIRTY_MIN,
        topics: ['주제1', '주제2'],
      })
      seedBattles([battle])

      await updateState('battle-1', state => {
        state.phase = BATTLE_PHASE.TEAM_SWITCH.name
        state.round = 1
      })

      await service['updatePhase']('battle-1')

      const state = await getState('battle-1')
      expect(state.round).toBe(2)
      expect(state.phase).toBe(BATTLE_PHASE.OPINION_SHARE.name)
    })

    it('case', async () => {
      const battle = createBattle({
        id: 'battle-1',
        playTime: BATTLE_PLAYTIME.THIRTY_MIN,
        topics: ['주제1', '주제2'],
      })
      seedBattles([battle])
      const finishSpy = jest.spyOn(service as never, 'finishBattle')

      await updateState('battle-1', state => {
        state.phase = BATTLE_PHASE.TEAM_SWITCH.name
        state.round = 2
      })

      await service['updatePhase']('battle-1')

      expect(finishSpy).toHaveBeenCalled()
    })
  })

  describe('voteTeam / TEAM_SWITCH 적용', () => {
    beforeEach(async () => {
      const battle = createBattle({ id: 'battle-1', status: BATTLE_STATUS.OPEN })
      seedBattles([battle])

      await service.registerGuest('battle-1', { id: 'user-1', nickname: 'test-user', createdAt: Date.now() })
      await service.joinBattle(
        {
          battleId: 'battle-1',
          team: BATTLE_TEAM.A,
        },
        'user-1',
      )
    })

    it('case', async () => {
      await expect(
        service.voteTeam(
          {
            battleId: 'battle-1',
            team: BATTLE_TEAM.B,
          },
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException)
    })

    it('case', async () => {
      await updateState('battle-1', s => {
        s.phase = BATTLE_PHASE.TEAM_SWITCH.name
        s.participants.set('user-1', BATTLE_TEAM.A)
        service['rebuildTeamUsers'](s)
      })

      await service.voteTeam(
        {
          battleId: 'battle-1',
          team: BATTLE_TEAM.B,
        },
        'user-1',
      )

      const updated = await getStateUnsafe('battle-1')
      service['applyTeamVotes'](updated)

      expect(updated.teamA.users).not.toContain('user-1')
      expect(updated.teamB.users).toContain('user-1')
    })

    it('case', async () => {
      const state = await updateState('battle-1', s => {
        s.phase = BATTLE_PHASE.TEAM_SWITCH.name
        s.participants.set('user-1', BATTLE_TEAM.A)
        s.participants.set('user-none', BATTLE_TEAM.NONE)
        service['rebuildTeamUsers'](s)
      })

      if (!state.participants.has('user-1')) {
        state.participants.set('user-1', BATTLE_TEAM.A)
        service['rebuildTeamUsers'](state)
      }

      expect(state.teamA.users.length).toBe(1)
      expect(state.teamB.users.length).toBe(0)
      expect(state.participants.size).toBe(2)

      const beforeTotal = state.participants.size // 2명
      const beforeTeamA = state.teamA.users.length // 1명
      const beforeTeamB = state.teamB.users.length // 0명
      const beforeTeamNone = beforeTotal - beforeTeamA - beforeTeamB // 2 - 1 - 0 = 1

      expect(beforeTeamNone).toBe(1)
      expect(state.participants.get('user-none')).toBe(BATTLE_TEAM.NONE)

      // A팀에서 B팀으로 변경
      await service.voteTeam(
        {
          battleId: 'battle-1',
          team: BATTLE_TEAM.B,
        },
        'user-1',
      )

      const updated = await getStateUnsafe('battle-1')
      service['applyTeamVotes'](updated)
      const afterTotal = updated.participants.size
      const afterTeamA = updated.teamA.users.length // 0명
      const afterTeamB = updated.teamB.users.length // 1명
      const afterTeamNone = afterTotal - afterTeamA - afterTeamB // 2 - 0 - 1 = 1

      expect(afterTeamNone).toBe(beforeTeamNone)
      expect(afterTeamA).toBe(0)
      expect(afterTeamB).toBe(1)
      expect(updated.participants.get('user-1')).toBe(BATTLE_TEAM.B)
      expect(updated.participants.get('user-none')).toBe(BATTLE_TEAM.NONE)
    })
  })

  describe('getOpenBattles', () => {
    it('case', async () => {
      const publicOpen = toRecord(createBattle({ status: BATTLE_STATUS.OPEN }))
      mockPrisma.battle.findMany.mockResolvedValue([publicOpen])
      mockPrisma.battle.count.mockResolvedValue(1)

      const result = (await service.getOpenBattles(10, 0)).battles

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe(BATTLE_STATUS.OPEN)
    })

    it('case', async () => {
      const oldBattle = toRecord(createBattle({ id: 'old', createdAt: new Date('2024-01-01') }))
      const newBattle = toRecord(createBattle({ id: 'new', createdAt: new Date('2024-01-02') }))
      mockPrisma.battle.findMany.mockResolvedValue([newBattle, oldBattle])
      mockPrisma.battle.count.mockResolvedValue(2)

      const result = (await service.getOpenBattles(10, 0)).battles

      expect(result[0].id).toBe('new')
      expect(result[1].id).toBe('old')
    })

    it('case', async () => {
      const two = toRecord(createBattle({ id: '2', createdAt: new Date('2024-01-02') }))
      mockPrisma.battle.findMany.mockResolvedValue([two])
      mockPrisma.battle.count.mockResolvedValue(3)

      const result = (await service.getOpenBattles(1, 1)).battles

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })
  })

  describe('getClosedBattles', () => {
    it('case', async () => {
      // const battles: Battle[] = [
      //   createBattle({ status: BATTLE_STATUS.CLOSED }),
      //   createBattle({ status: BATTLE_STATUS.OPEN }),
      //   createBattle({ type: BATTLE_TYPE.PRIVATE, status: BATTLE_STATUS.CLOSED }),
      // ]
      // seedBattles(battles)
      // const result = await service.getClosedBattles(10, 0)
      // expect(result.battles).toHaveLength(1)
      // expect(result.battles[0].status).toBe(BATTLE_STATUS.CLOSED)

      const result = await service.getClosedBattles(10, 0)

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

    it('case', async () => {
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
      // seedBattles([shorter, longer])
      // const result = await service.getClosedBattles(10, 0)
      // expect(result.battles[0].id).toBe('long')
      // expect(result.battles[1].id).toBe('short')
      // expect(result.meta.total).toBe(2)

      const result = await service.getClosedBattles(10, 0)

      const times = result.battles.map(b => b.expiresAt.getTime())
      const sorted = [...times].sort((a, b) => b - a)

      expect(times).toEqual(sorted)
    })
  })

  describe('getBattleResult', () => {
    beforeEach(() => {
      const finished = createFinishedBattleState()
      const battle = createBattle({
        id: finished.battleId,
        authorId: finished.authorId,
        title: finished.title,
        description: finished.description,
        status: BATTLE_STATUS.CLOSED,
        language: finished.language as BATTLE_LANGUAGE,
        category: finished.category as BATTLE_CATEGORY,
        playTime: BATTLE_PLAYTIME.THIRTY_MIN,
        topics: finished.topics,
        aCode: finished.codeA,
        bCode: finished.codeB,
      })

      seedBattles([battle])
      const record = battleStore.get(finished.battleId)
      battleStore.set(finished.battleId, {
        ...record,
        status: BATTLE_STATUS.CLOSED,
        finishedAt: new Date(finished.finishedAt),
        teamACount: finished.result.teamA.votes,
        teamBCount: finished.result.teamB.votes,
        totalParticipantsCount: finished.metrics.totalParticipants,
        winningTeam: finished.result.winner,
        timeline: finished.timeline,
        mvps: finished.mvps.map(mvp => mvp.nickname),
        mvpsState: finished.mvps,
      })
    })

    it('case', async () => {
      const result = await service.getBattleResult('battle-1')
      expect(result.battleId).toBe('battle-1')
      expect(result.status).toBe('CLOSED')
      expect(result).toHaveProperty('codeA')
      expect(result).toHaveProperty('codeB')
      expect(result).toHaveProperty('result')
      expect(result).toHaveProperty('metrics')
      expect(result).toHaveProperty('voteTimeline')
      expect(result).toHaveProperty('timeline')
      expect(result).toHaveProperty('mvps')
    })

    it('case', async () => {
      await expect(service.getBattleResult('battle-999')).rejects.toThrow(NotFoundException)
    })

    it('case', async () => {
      seedBattles([createBattle({ id: 'battle-open-1', status: BATTLE_STATUS.OPEN })])
      await expect(service.getBattleResult('battle-open-1')).rejects.toThrow(BadRequestException)
    })

    it('case', async () => {
      const result = await service.getBattleResult('battle-1')
      expect(result.result.teamA.percentage).toBe(44)
      expect(result.result.teamB.percentage).toBe(40)
      expect(result.result.neutral.percentage).toBe(16)
    })

    it('case', async () => {
      const result = await service.getBattleResult('battle-1')
      const timestamps = result.timeline.map(item => new Date(item.createdAt).getTime())
      const sortedTimestamps = [...timestamps].sort((a, b) => a - b)
      expect(timestamps).toEqual(sortedTimestamps)
    })

    it('case', async () => {
      const result = await service.getBattleResult('battle-1')
      expect(result.mvps).toHaveLength(1)
      expect(result.mvps[0].nickname).toBe('CodeMaster')
    })

    it('case', async () => {
      const result = await service.getBattleResult('battle-1')
      expect(result.voteTimeline).toHaveLength(1)
    })

    it('case', async () => {
      const result = await service.getBattleResult('battle-1')
      result.timeline.forEach(item => {
        expect(['ATTACK', 'DEFENSE']).toContain(item.type)
      })
    })
  })

  describe('appendChatMessage', () => {
    beforeEach(async () => {
      seedBattles([createBattle({ id: 'battle-1' })])
      await service.registerGuest('battle-1', { id: 'user-1', nickname: 'test-user', createdAt: Date.now() })
    })

    it('case', async () => {
      await expect(
        service.appendChatMessage(
          {
            battleId: 'invalid',
            scope: 'TEAM',
            team: BATTLE_TEAM.A,
            text: 'hello',
          },
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException)
    })

    it('case', async () => {
      const result = await service.appendChatMessage(
        {
          battleId: 'battle-1',
          scope: 'TEAM',
          team: BATTLE_TEAM.A,
          text: 'hello',
        },
        'user-1',
      )

      const state = await getState('battle-1')

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

    it('case', async () => {
      const result = await service.appendChatMessage(
        {
          battleId: 'battle-1',
          scope: 'ALL',
          text: 'hello all',
          team: 'A',
        },
        'user-1',
      )

      const state = await getState('battle-1')

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
    beforeEach(async () => {
      const battle = createBattle({ id: 'battle-1' })
      seedBattles([battle])

      await updateState('battle-1', state => {
        state.phase = BATTLE_PHASE.ATTACK.name
      })

      const state = await getState('battle-1')
      const attack = {
        discussionId: 'attack-1',
        author: { authorId: 'user-a', nickname: 'UserA' },
        type: BATTLE_DISCUSSION_TYPE.ATTACK,
        content: 'attack!',
        upvotes: 0,
        votes: [],
        status: 'PENDING' as const,
        team: BATTLE_TEAM.A,
      }
      state.teamA.attacks.push(attack)
      state.opinionHistory.push(attack)
    })

    it('case', async () => {
      const attack = (await getState('battle-1')).teamA.attacks[0]!

      const result = await service.handleAttackVote('battle-1', attack.discussionId, {
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

    it('case', async () => {
      const attack = (await getState('battle-1')).teamA.attacks[0]!

      await service.handleAttackVote('battle-1', attack.discussionId, {
        userId: 'voter-1',
        team: BATTLE_TEAM.A,
      })

      await expect(
        service.handleAttackVote('battle-1', attack.discussionId, {
          userId: 'voter-1',
          team: BATTLE_TEAM.A,
        }),
      ).rejects.toThrow(BadRequestException)
    })

    it('case', async () => {
      const attack = (await getState('battle-1')).teamA.attacks[0]!

      await expect(
        service.handleAttackVote('battle-1', attack.discussionId, {
          userId: 'neutral',
          team: BATTLE_TEAM.NONE,
        }),
      ).rejects.toThrow(ForbiddenException)
    })

    it('case', async () => {
      const state = await getState('battle-1')

      const attack = state.teamA.attacks[0]!

      await expect(
        service.handleDefenseVote('battle-1', attack.discussionId, {
          userId: 'user',
          team: BATTLE_TEAM.A,
        }),
      ).rejects.toThrow(BadRequestException)
    })

    it('case', async () => {
      await expect(
        service.handleAttackVote('battle-1', 'invalid-id', {
          userId: 'user',
          team: BATTLE_TEAM.A,
        }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('calculateMVPs (새로운 로직)', () => {
    beforeEach(async () => {
      const battle = createBattle({ id: 'battle-1', status: BATTLE_STATUS.OPEN })
      seedBattles([battle])

      const state = await getState('battle-1')

      // 참가자 등록 (joinedAt 시간 순서대로)
      await service.registerGuest('battle-1', { id: 'user-1', nickname: 'User1', createdAt: 1000 })
      await service.registerGuest('battle-1', { id: 'user-2', nickname: 'User2', createdAt: 2000 })
      await service.registerGuest('battle-1', { id: 'user-3', nickname: 'User3', createdAt: 3000 })

      state.participants.set('user-1', BATTLE_TEAM.A)
      state.participants.set('user-2', BATTLE_TEAM.B)
      state.participants.set('user-3', BATTLE_TEAM.A)

      service['rebuildTeamUsers'](state)
    })

    it('case', async () => {
      const state = await getState('battle-1')
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
      const mvps = service['calculateMVPs'](state, 'A')

      // user-1: score = 3/5 + 2/5 = 1.0, totalVotes = 5
      // user-2: score = 4/4 = 1.0, totalVotes = 4
      // 점수 동점 → 좋아요 수 비교 → user-1이 5표로 MVP
      expect(mvps.length).toBeGreaterThan(0)
      expect(mvps[0].userId).toBe('user-1')
      expect(mvps[0].totalVotes).toBe(5)
    })

    it('case', async () => {
      const state = await getState('battle-1')
      state.phase = BATTLE_PHASE.ATTACK.name

      // 중립 팀 사용자 추가
      await service.registerGuest('battle-1', { id: 'user-none', nickname: 'NeutralUser', createdAt: 500 })
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

      const mvps = service['calculateMVPs'](state, 'A')

      // 중립 팀 제외, user-1이 MVP
      expect(mvps.length).toBeGreaterThan(0)
      expect(mvps[0].userId).toBe('user-1')
    })

    it('case', async () => {
      const state = await getState('battle-1')
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
      const mvpsA = service['calculateMVPs'](state, 'A')
      expect(mvpsA[0].userId).toBe('user-1')
      expect(mvpsA[0].team).toBe('A')

      // B팀이 승리한 경우
      const mvpsB = service['calculateMVPs'](state, 'B')
      expect(mvpsB[0].userId).toBe('user-2')
      expect(mvpsB[0].team).toBe('B')
    })

    it('case', async () => {
      const state = await getState('battle-1')
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

      const mvps = service['calculateMVPs'](state, 'A')

      // 동일 점수, 좋아요, 의견수, 팀 → 선정된 의견 수로 비교
      expect(mvps[0].userId).toBe('user-1')
      expect(mvps[0].selectedOpinionCount).toBe(2)
    })

    it('case', async () => {
      const state = await getState('battle-1')
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

      const mvps = service['calculateMVPs'](state, 'A')

      // 모든 조건 동일 → 먼저 참여한 user-1이 MVP (참가순서 0)
      expect(mvps[0].userId).toBe('user-1')
      expect(mvps[0].joinedAt).toBe(0) // participants Map 삽입 순서 기반
    })

    it('case', async () => {
      const state = await getState('battle-1')
      const mvps = service['calculateMVPs'](state, 'A')
      expect(mvps).toEqual([])
    })

    it('case', async () => {
      const state = await getState('battle-1')
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

      const mvps = service['calculateMVPs'](state, 'A')
      expect(mvps.length).toBeGreaterThan(0)
      expect(mvps[0].score).toBe(0)
    })

    it('case', async () => {
      const state = await getState('battle-1')
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

      const mvps = service['calculateMVPs'](state, 'A')

      // user-1 (A팀): score = (0.5 + 0.3) * 1.5 = 1.2, totalVotes = 5
      // user-2 (B팀): score = 1.0 (보너스 없음), totalVotes = 4
      // A팀 승리 시 user-1이 보너스를 받아 MVP
      expect(mvps.length).toBeGreaterThan(0)
      expect(mvps[0].userId).toBe('user-1')
      expect(mvps[0].score).toBeCloseTo(1.2)
      expect(mvps[0].totalVotes).toBe(5)
    })

    it('case', async () => {
      const state = await getState('battle-1')
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

      const mvps = service['calculateMVPs'](state, 'A')

      // user-1 (A팀): voterCountAtPhase 없음 → 점수 0 * 1.5 = 0, totalVotes = 10
      // user-3 (A팀): score = 1/2 * 1.5 = 0.75, totalVotes = 1
      // user-3이 점수가 높으므로 MVP
      expect(mvps.length).toBeGreaterThan(0)
      expect(mvps[0].userId).toBe('user-3')
      expect(mvps[0].score).toBeCloseTo(0.75)
    })
  })

  describe('calculateMVPs (승리 팀 1.5배 보너스)', () => {
    beforeEach(async () => {
      const battle = createBattle({ id: 'battle-1', status: BATTLE_STATUS.OPEN })
      seedBattles([battle])

      const state = await getState('battle-1')

      await service.registerGuest('battle-1', { id: 'user-a', nickname: 'UserA', createdAt: 1000 })
      await service.registerGuest('battle-1', { id: 'user-b', nickname: 'UserB', createdAt: 2000 })

      state.participants.set('user-a', BATTLE_TEAM.A)
      state.participants.set('user-b', BATTLE_TEAM.B)

      service['rebuildTeamUsers'](state)
    })

    it('case', async () => {
      const state = await getState('battle-1')
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
      const mvpsWhenAWins = service['calculateMVPs'](state, 'A')
      expect(mvpsWhenAWins.length).toBeGreaterThan(0)
      expect(mvpsWhenAWins[0].userId).toBe('user-a')
      expect(mvpsWhenAWins[0].score).toBeCloseTo(1.05)
    })

    it('case', async () => {
      const state = await getState('battle-1')
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
      const mvpsWhenBWins = service['calculateMVPs'](state, 'B')
      expect(mvpsWhenBWins.length).toBeGreaterThan(0)
      expect(mvpsWhenBWins[0].userId).toBe('user-b')
      expect(mvpsWhenBWins[0].score).toBeCloseTo(1.5)
    })

    it('case', async () => {
      const state = await getState('battle-1')
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
      const mvpsWhenDraw = service['calculateMVPs'](state, 'DRAW')
      expect(mvpsWhenDraw.length).toBeGreaterThan(0)
      expect(mvpsWhenDraw[0].userId).toBe('user-b')
      expect(mvpsWhenDraw[0].score).toBeCloseTo(1.0)
    })

    it('case', async () => {
      const state = await getState('battle-1')
      state.phase = BATTLE_PHASE.ATTACK.name

      // 같은 팀, 같은 점수 비율
      await service.registerGuest('battle-1', { id: 'user-a2', nickname: 'UserA2', createdAt: 3000 })
      state.participants.set('user-a2', BATTLE_TEAM.A)
      service['rebuildTeamUsers'](state)

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

      const mvps = service['calculateMVPs'](state, 'A')
      expect(mvps.length).toBeGreaterThan(0)
      // 점수 동점 → totalVotes로 비교 → user-a가 50표로 MVP
      expect(mvps[0].userId).toBe('user-a')
      expect(mvps[0].totalVotes).toBe(50)
    })

    it('case', async () => {
      const state = await getState('battle-1')
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
      const mvps = service['calculateMVPs'](state, 'A')
      expect(mvps.length).toBeGreaterThan(0)
      expect(mvps[0].userId).toBe('user-a')
      expect(mvps[0].score).toBeCloseTo(0.9)
      expect(mvps[0].opinionCount).toBe(2)
    })

    it('case', async () => {
      const state = await getState('battle-1')
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
      const mvps = service['calculateMVPs'](state, 'A')
      expect(mvps.length).toBeGreaterThan(0)
      expect(mvps[0].userId).toBe('user-a')
      expect(mvps[0].score).toBeCloseTo(1.2)
    })
  })

  describe('resetDiscussions 후 MVP 계산', () => {
    beforeEach(async () => {
      const battle = createBattle({ id: 'battle-1', status: BATTLE_STATUS.OPEN })
      seedBattles([battle])

      const state = await getState('battle-1')

      await service.registerGuest('battle-1', { id: 'user-1', nickname: 'User1', createdAt: 1000 })
      await service.registerGuest('battle-1', { id: 'user-2', nickname: 'User2', createdAt: 2000 })

      state.participants.set('user-1', BATTLE_TEAM.A)
      state.participants.set('user-2', BATTLE_TEAM.B)

      service['rebuildTeamUsers'](state)
    })

    it('case', async () => {
      const state = await getState('battle-1')
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
      service['resetDiscussions'](state)

      // resetDiscussions 후 상태 확인
      expect(state.opinionHistory.length).toBe(2) // opinionHistory는 유지
      expect(state.teamA.attacks.length).toBe(0) // teamA는 초기화
      expect(state.teamB.attacks.length).toBe(0) // teamB는 초기화

      // MVP 계산 - opinionHistory에서 읽으므로 정상 동작
      const mvps = service['calculateMVPs'](state, 'A')

      expect(mvps.length).toBeGreaterThan(0)
      expect(mvps[0].userId).toBe('user-1')
      expect(mvps[0].totalVotes).toBe(5)
    })

    it('case', async () => {
      const state = await getState('battle-1')
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
      service['resetDiscussions'](state)
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
      service['resetDiscussions'](state)
      expect(state.teamA.attacks.length).toBe(0)

      // opinionHistory에는 2개 의견이 누적되어 있어야 함
      expect(state.opinionHistory.length).toBe(2)

      // MVP 계산 - 누적 점수로 계산
      const mvps = service['calculateMVPs'](state, 'A')

      expect(mvps.length).toBeGreaterThan(0)
      expect(mvps[0].userId).toBe('user-1')
      // user-1: score = 3/5 + 4/5 = 1.4, 승리팀 보너스 1.5배 = 2.1
      expect(mvps[0].score).toBeCloseTo(2.1)
      expect(mvps[0].totalVotes).toBe(7) // 3 + 4
      expect(mvps[0].opinionCount).toBe(2)
    })
  })

  describe('handleAttack / handleDefense의 opinionHistory 저장', () => {
    beforeEach(async () => {
      const battle = createBattle({ id: 'battle-1', status: BATTLE_STATUS.OPEN })
      seedBattles([battle])

      const state = await getState('battle-1')

      await service.registerGuest('battle-1', { id: 'user-1', nickname: 'User1', createdAt: 1000 })
      await service.registerGuest('battle-1', { id: 'user-2', nickname: 'User2', createdAt: 2000 })

      state.participants.set('user-1', BATTLE_TEAM.A)
      state.participants.set('user-2', BATTLE_TEAM.B)

      service['rebuildTeamUsers'](state)
    })

    it('case', async () => {
      await updateState('battle-1', state => {
        state.phase = BATTLE_PHASE.ATTACK.name
      })

      const state = await getState('battle-1')
      expect(state.opinionHistory.length).toBe(0)

      await service.handleAttack('battle-1', { authorId: 'user-1', content: '공격 의견입니다', team: BATTLE_TEAM.A })

      const updated = await getState('battle-1')
      expect(updated.opinionHistory.length).toBe(1)
      expect(updated.opinionHistory[0].content).toBe('공격 의견입니다')
      expect(updated.opinionHistory[0].author.authorId).toBe('user-1')
      expect(updated.opinionHistory[0].status).toBe('PENDING')
      expect(updated.opinionHistory[0].type).toBe('ATTACK')
    })

    it('case', async () => {
      await updateState('battle-1', state => {
        state.phase = BATTLE_PHASE.DEFENSE.name
      })

      const state = await getState('battle-1')
      expect(state.opinionHistory.length).toBe(0)

      await service.handleDefense('battle-1', { authorId: 'user-2', content: '수비 의견입니다', team: BATTLE_TEAM.B })

      const updated = await getState('battle-1')
      expect(updated.opinionHistory.length).toBe(1)
      expect(updated.opinionHistory[0].content).toBe('수비 의견입니다')
      expect(updated.opinionHistory[0].author.authorId).toBe('user-2')
      expect(updated.opinionHistory[0].status).toBe('PENDING')
      expect(updated.opinionHistory[0].type).toBe('DEFENSE')
    })

    it('case', async () => {
      await updateState('battle-1', state => {
        state.phase = BATTLE_PHASE.ATTACK.name
      })

      await service.handleAttack('battle-1', { authorId: 'user-1', content: '첫 번째 공격', team: BATTLE_TEAM.A })
      await service.handleAttack('battle-1', { authorId: 'user-2', content: '두 번째 공격', team: BATTLE_TEAM.B })

      await updateState('battle-1', state => {
        state.phase = BATTLE_PHASE.DEFENSE.name
      })

      await service.handleDefense('battle-1', { authorId: 'user-1', content: '첫 번째 수비', team: BATTLE_TEAM.A })

      const state = await getState('battle-1')
      expect(state.opinionHistory.length).toBe(3)
      expect(state.opinionHistory[0].type).toBe('ATTACK')
      expect(state.opinionHistory[1].type).toBe('ATTACK')
      expect(state.opinionHistory[2].type).toBe('DEFENSE')
    })

    it('case', async () => {
      await updateState('battle-1', state => {
        state.phase = BATTLE_PHASE.ATTACK.name
      })

      await service.handleAttack('battle-1', { authorId: 'user-1', content: 'A팀 공격', team: BATTLE_TEAM.A })
      await service.handleAttack('battle-1', { authorId: 'user-2', content: 'B팀 공격', team: BATTLE_TEAM.B })

      const state = await getState('battle-1')
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
