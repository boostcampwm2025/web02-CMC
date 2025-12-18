import { NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common'
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
  status: BATTLE_STATUS.OPEN,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  participantCount: 0,
  initialState: {
    round: 1,
    phase: BATTLE_PHASE.WAITING_FOR_START,
    timeRemainingSeconds: 600,
  },
  ...overrides,
})

describe('BattlesService', () => {
  let service: BattlesService

  beforeEach(() => {
    service = new BattlesService()
  })

  describe('initBattleState', () => {
    it('battleId가 없으면 BadRequestException을 던진다', () => {
      expect(() => service['initBattleState']('')).toThrow(BadRequestException)
    })

    it('이미 초기화된 배틀이면 중복 생성하지 않는다', () => {
      service['initBattleState']('battle-1')
      service['initBattleState']('battle-1')

      expect(service['activeBattles'].size).toBe(1)
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

  describe('getOpenBattles', () => {
    it('PUBLIC 이면서 OPEN 상태인 배틀만 반환한다', () => {
      const battles: Battle[] = [
        createBattle({ status: BATTLE_STATUS.OPEN }),
        createBattle({ status: BATTLE_STATUS.CLOSED }),
        createBattle({ type: BATTLE_TYPE.PRIVATE, status: BATTLE_STATUS.OPEN }),
      ]

      service.setBattlesForTest(battles)

      const result = service.getOpenBattles(10, 0)

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe(BATTLE_STATUS.OPEN)
    })

    it('배틀 생성 시간 기준 최신순으로 정렬된다', () => {
      const battles = [createBattle({ id: 'old', createdAt: new Date('2024-01-01') }), createBattle({ id: 'new', createdAt: new Date('2024-01-02') })]

      service.setBattlesForTest(battles)

      const result = service.getOpenBattles(10, 0)

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

      const result = service.getOpenBattles(1, 1)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })
  })

  describe('getClosedBattles', () => {
    it('PUBLIC 이면서 FINISHED 상태인 배틀만 반환한다', () => {
      const battles: Battle[] = [
        createBattle({ status: BATTLE_STATUS.CLOSED }),
        createBattle({ status: BATTLE_STATUS.OPEN }),
        createBattle({ type: BATTLE_TYPE.PRIVATE, status: BATTLE_STATUS.CLOSED }),
      ]

      service.setBattlesForTest(battles)

      const result = service.getClosedBattles(10, 0)

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe(BATTLE_STATUS.CLOSED)
    })

    it('배틀 종료 시각 기준 최신 종료 순으로 정렬된다', () => {
      const shorter = createBattle({
        id: 'short',
        playTime: BATTLE_PLAYTIME.FIVE_MIN,
        status: BATTLE_STATUS.CLOSED,
      })
      const longer = createBattle({
        id: 'long',
        playTime: BATTLE_PLAYTIME.THIRTY_MIN,
        status: BATTLE_STATUS.CLOSED,
      })

      service.setBattlesForTest([shorter, longer])

      const result = service.getClosedBattles(10, 0)

      expect(result[0].id).toBe('long')
      expect(result[1].id).toBe('short')
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
      expect(state.teamNone.chats).toHaveLength(0)
    })

    it('전체 채팅 메시지를 전체 채팅에 추가한다', () => {
      const result = service.appendChatMessage(
        {
          battleId: 'battle-1',
          scope: 'ALL',
          text: 'hello all',
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
      expect(state.teamNone.chats).toHaveLength(0)
    })
  })
})
