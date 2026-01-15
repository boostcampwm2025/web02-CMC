import { NotFoundException, BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common'
import { Battle } from '../types/battles.types'
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
  playTime: BATTLE_PLAYTIME.TEN_MIN,
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
    })

    it('battleId가 없으면 BadRequestException을 던진다', () => {
      expect(() => service.joinBattle({ battleId: '', team: 'A', userId: '' }, 'client-1')).toThrow(BadRequestException)
    })

    it('존재하지 않는 배틀이면 NotFoundException을 던진다', () => {
      expect(() =>
        service.joinBattle(
          {
            battleId: 'invalid',
            team: 'A',
            userId: '',
          },
          'client-1',
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
            userId: '',
          },
          'client-1',
        ),
      ).toThrow(UnauthorizedException)
    })

    it('비공개 배틀에 올바른 비밀번호로 입장한다', () => {
      const result = service.joinBattle(
        {
          battleId: 'private-battle',
          password: '1234',
          team: 'A',
          userId: '',
        },
        'client-1',
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
            userId: '',
          },
          'client-1',
        ),
      ).toThrow(BadRequestException)
    })

    it('공개 배틀에 정상적으로 입장한다', () => {
      const result = service.joinBattle(
        {
          battleId: 'public-battle',
          team: 'A',
          userId: '',
        },
        'client-1',
      )

      expect(result.team).toBe('A')
      expect(result.battleState.teamA.users).toContain('client-1')
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
        playTime: { ...BATTLE_PLAYTIME.TEN_MIN },
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
        playTime: { ...BATTLE_PLAYTIME.TEN_MIN },
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

      service.joinBattle(
        {
          battleId: 'battle-1',
          team: BATTLE_TEAM.A,
          userId: 'user-1',
        },
        'client-1',
      )
    })

    it('TEAM_SWITCH가 아니면 팀 변경 투표가 거부된다', () => {
      expect(() =>
        service.voteTeam(
          {
            battleId: 'battle-1',
            team: BATTLE_TEAM.B,
          },
          'client-1',
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
        'client-1',
      )

      service['updatePhase']('battle-1')

      expect(state.teamA.users).not.toContain('client-1')
      expect(state.teamB.users).toContain('client-1')
    })

    it('TEAM_SWITCH 종료 시 팀 변경 후 teamCount가 올바르게 계산된다', () => {
      const state = service['activeBattles'].get('battle-1')!
      state.phase = BATTLE_PHASE.TEAM_SWITCH.name

      expect(state.teamA.users.length).toBe(1)
      expect(state.teamB.users.length).toBe(0)
      expect(state.participants.size).toBe(1)

      service['addParticipant']('battle-1', 'client-none', BATTLE_TEAM.NONE)

      const beforeTotal = state.participants.size // 2명
      const beforeTeamA = state.teamA.users.length // 1명
      const beforeTeamB = state.teamB.users.length // 0명
      const beforeTeamNone = beforeTotal - beforeTeamA - beforeTeamB // 2 - 1 - 0 = 1

      expect(beforeTeamNone).toBe(1)
      expect(state.participants.get('client-none')).toBe(BATTLE_TEAM.NONE)

      // A팀에서 B팀으로 변경
      service.voteTeam(
        {
          battleId: 'battle-1',
          team: BATTLE_TEAM.B,
        },
        'client-1',
      )

      service['updatePhase']('battle-1')

      const afterTotal = state.participants.size
      const afterTeamA = state.teamA.users.length // 0명
      const afterTeamB = state.teamB.users.length // 1명
      const afterTeamNone = afterTotal - afterTeamA - afterTeamB // 2 - 0 - 1 = 1

      expect(afterTeamNone).toBe(beforeTeamNone)
      expect(afterTeamA).toBe(0)
      expect(afterTeamB).toBe(1)
      expect(state.participants.get('client-1')).toBe(BATTLE_TEAM.B)
      expect(state.participants.get('client-none')).toBe(BATTLE_TEAM.NONE)
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
          sender: 'user-1',
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
          sender: 'user-1',
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
})
