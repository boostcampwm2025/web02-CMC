import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException } from '@nestjs/common'
import { BattleTeamSwitchService } from './battleTeamSwitch.service'
import { ActiveBattleState } from '../../models/types/battle.types'
import { BATTLE_PHASE, BATTLE_TEAM } from '../../models/const/battles.const'

describe('BattleTeamSwitchService', () => {
  let service: BattleTeamSwitchService

  const createActiveState = (overrides: Partial<ActiveBattleState> = {}): ActiveBattleState => ({
    battleId: 'battle-1',
    all: { roomId: 'battle:battle-1', chats: [], attacks: [], defenses: [] },
    teamA: { roomId: 'battle:battle-1:A', chats: [], users: [], attacks: [], defenses: [] },
    teamB: { roomId: 'battle:battle-1:B', chats: [], users: [], attacks: [], defenses: [] },
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
})
