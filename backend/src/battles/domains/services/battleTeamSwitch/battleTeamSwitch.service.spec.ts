import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException } from '@nestjs/common'
import { BattleTeamSwitchService } from './battleTeamSwitch.service'
import { ActiveBattleState } from '../../models/types/battle.types'
import { BATTLE_PHASE, BATTLE_TEAM } from '../../models/const/battles.const'

describe('BattleTeamSwitchService', () => {
  let service: BattleTeamSwitchService

  const createActiveState = (overrides: Partial<ActiveBattleState> = {}): ActiveBattleState => ({
    battleId: 'battle-1',
    status: 'OPEN',
    all: { roomId: 'battle:battle-1:room:all', chats: [], attacks: [], defenses: [] },
    teamA: { roomId: 'battle:battle-1:room:A', chats: [], users: [], attacks: [], defenses: [] },
    teamB: { roomId: 'battle:battle-1:room:B', chats: [], users: [], attacks: [], defenses: [] },
    phase: BATTLE_PHASE.TEAM_SWITCH.name,
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
      providers: [BattleTeamSwitchService],
    }).compile()

    service = module.get(BattleTeamSwitchService)
  })

  describe('applyTeamVote / applyTeamSwitch', () => {
    it('case', () => {
      const state = createActiveState({ battleId: 'battle-1' })
      state.phase = BATTLE_PHASE.OPINION_SHARE.name

      expect(() => {
        service.applyTeamVote(state, 'user-1', BATTLE_TEAM.B)
      }).toThrow(BadRequestException)
      expect(() => {
        service.applyTeamVote(state, 'user-1', BATTLE_TEAM.B)
      }).toThrow('팀 변경 투표는 TEAM_SWITCH 페이즈에서만 가능합니다.')
    })

    it('case', () => {
      const state = createActiveState({ battleId: 'battle-1' })
      state.phase = BATTLE_PHASE.TEAM_SWITCH.name
      state.participants.set('user-1', BATTLE_TEAM.A)
      service.rebuildTeamUsers(state)

      service.applyTeamVote(state, 'user-1', BATTLE_TEAM.B)

      const emitTeamUpdated = jest.fn()
      service.applyTeamSwitch(state, emitTeamUpdated)

      expect(state.teamA.users).not.toContain('user-1')
      expect(state.teamB.users).toContain('user-1')
      expect(state.participants.get('user-1')).toBe(BATTLE_TEAM.B)
    })

    it('case', () => {
      const state = createActiveState({ battleId: 'battle-1' })
      state.phase = BATTLE_PHASE.TEAM_SWITCH.name
      state.participants.set('user-1', BATTLE_TEAM.A)
      state.participants.set('user-none', BATTLE_TEAM.NONE)
      service.rebuildTeamUsers(state)

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
      service.applyTeamVote(state, 'user-1', BATTLE_TEAM.B)

      const emitTeamUpdated = jest.fn()
      service.applyTeamSwitch(state, emitTeamUpdated)

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

  describe('applyTeamSwitch', () => {
    it('변경 사항이 없으면 이벤트를 발생시키지 않는다', () => {
      const state = createActiveState()
      state.participants.set('user-1', BATTLE_TEAM.A)
      service.rebuildTeamUsers(state)
      // teamVotes에 아무것도 없음

      const emitTeamUpdated = jest.fn()
      service.applyTeamSwitch(state, emitTeamUpdated)

      expect(emitTeamUpdated).not.toHaveBeenCalled()
    })

    it('같은 팀으로 투표하면 변경되지 않는다', () => {
      const state = createActiveState()
      state.participants.set('user-1', BATTLE_TEAM.A)
      service.rebuildTeamUsers(state)
      state.teamVotes.set('user-1', BATTLE_TEAM.A) // 같은 팀으로 투표

      const emitTeamUpdated = jest.fn()
      service.applyTeamSwitch(state, emitTeamUpdated)

      expect(emitTeamUpdated).not.toHaveBeenCalled()
      expect(state.participants.get('user-1')).toBe(BATTLE_TEAM.A)
    })

    it('스위치 후 teamVotes를 클리어한다', () => {
      const state = createActiveState()
      state.participants.set('user-1', BATTLE_TEAM.A)
      service.rebuildTeamUsers(state)
      state.teamVotes.set('user-1', BATTLE_TEAM.B)

      const emitTeamUpdated = jest.fn()
      service.applyTeamSwitch(state, emitTeamUpdated)

      expect(state.teamVotes.size).toBe(0)
    })

    it('변경 시 올바른 콜백 파라미터를 전달한다', () => {
      const state = createActiveState()
      state.participants.set('user-1', BATTLE_TEAM.A)
      state.participants.set('user-2', BATTLE_TEAM.B)
      service.rebuildTeamUsers(state)
      state.teamVotes.set('user-1', BATTLE_TEAM.B)

      const emitTeamUpdated = jest.fn()
      service.applyTeamSwitch(state, emitTeamUpdated)

      expect(emitTeamUpdated).toHaveBeenCalledWith('battle-1', 1, { teamA: 1, teamB: 1, teamNone: 0 }, { teamA: 0, teamB: 2, teamNone: 0 }, [
        { userId: 'user-1', from: BATTLE_TEAM.A, to: BATTLE_TEAM.B },
      ])
    })
  })

  describe('applyTeamVote', () => {
    it('참가자가 아닌 유저는 팀 변경 투표를 할 수 없다', () => {
      const state = createActiveState()
      state.phase = BATTLE_PHASE.TEAM_SWITCH.name

      expect(() => {
        service.applyTeamVote(state, 'non-participant', BATTLE_TEAM.A)
      }).toThrow(BadRequestException)
      expect(() => {
        service.applyTeamVote(state, 'non-participant', BATTLE_TEAM.A)
      }).toThrow('배틀 참가자만 팀 변경 투표를 할 수 있습니다.')
    })

    it('팀 변경 투표를 올바르게 저장한다', () => {
      const state = createActiveState()
      state.phase = BATTLE_PHASE.TEAM_SWITCH.name
      state.participants.set('user-1', BATTLE_TEAM.A)

      service.applyTeamVote(state, 'user-1', BATTLE_TEAM.B)

      expect(state.teamVotes.get('user-1')).toBe(BATTLE_TEAM.B)
    })
  })

  describe('applyParticipant', () => {
    it('참가자를 올바른 팀에 추가한다', () => {
      const state = createActiveState()
      const emitUserUpdated = jest.fn()

      service.applyParticipant(state, 'user-1', BATTLE_TEAM.A, emitUserUpdated)

      expect(state.participants.get('user-1')).toBe(BATTLE_TEAM.A)
      expect(state.teamA.users).toContain('user-1')
    })

    it('사용자 업데이트 이벤트를 발생시킨다', () => {
      const state = createActiveState()
      const emitUserUpdated = jest.fn()

      service.applyParticipant(state, 'user-1', BATTLE_TEAM.A, emitUserUpdated)

      expect(emitUserUpdated).toHaveBeenCalledWith('battle-1', {
        teamA: 1,
        teamB: 0,
        teamNone: 0,
      })
    })

    it('B팀에 참가자를 추가할 수 있다', () => {
      const state = createActiveState()
      const emitUserUpdated = jest.fn()

      service.applyParticipant(state, 'user-1', BATTLE_TEAM.B, emitUserUpdated)

      expect(state.participants.get('user-1')).toBe(BATTLE_TEAM.B)
      expect(state.teamB.users).toContain('user-1')
    })

    it('NONE 팀에 참가자를 추가할 수 있다', () => {
      const state = createActiveState()
      const emitUserUpdated = jest.fn()

      service.applyParticipant(state, 'user-1', BATTLE_TEAM.NONE, emitUserUpdated)

      expect(state.participants.get('user-1')).toBe(BATTLE_TEAM.NONE)
      expect(state.teamA.users).not.toContain('user-1')
      expect(state.teamB.users).not.toContain('user-1')
    })
  })

  describe('rebuildTeamUsers', () => {
    it('빈 참가자로도 정상 작동한다', () => {
      const state = createActiveState()
      state.participants.clear()

      service.rebuildTeamUsers(state)

      expect(state.teamA.users).toHaveLength(0)
      expect(state.teamB.users).toHaveLength(0)
    })

    it('모든 참가자가 NONE이면 팀 배열이 비어있다', () => {
      const state = createActiveState()
      state.participants.set('user-1', BATTLE_TEAM.NONE)
      state.participants.set('user-2', BATTLE_TEAM.NONE)

      service.rebuildTeamUsers(state)

      expect(state.teamA.users).toHaveLength(0)
      expect(state.teamB.users).toHaveLength(0)
    })

    it('팀 배열을 올바르게 재구성한다', () => {
      const state = createActiveState()
      state.participants.set('user-1', BATTLE_TEAM.A)
      state.participants.set('user-2', BATTLE_TEAM.A)
      state.participants.set('user-3', BATTLE_TEAM.B)
      state.participants.set('user-4', BATTLE_TEAM.NONE)

      service.rebuildTeamUsers(state)

      expect(state.teamA.users).toHaveLength(2)
      expect(state.teamA.users).toContain('user-1')
      expect(state.teamA.users).toContain('user-2')
      expect(state.teamB.users).toHaveLength(1)
      expect(state.teamB.users).toContain('user-3')
    })
  })
})
