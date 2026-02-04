import { Test, TestingModule } from '@nestjs/testing'
import { BattlePhaseService } from './battlePhase.service'
import { BATTLE_PHASE, BATTLE_MAX_PHASE_COUNT } from '../../models/const/battles.const'
import { ActiveBattleState } from '../../models/types/battle.types'

describe('BattlePhaseService', () => {
  let service: BattlePhaseService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BattlePhaseService],
    }).compile()

    service = module.get(BattlePhaseService)
  })

  const createState = (overrides: Partial<ActiveBattleState> = {}): ActiveBattleState => ({
    battleId: 'battle-1',
    all: { roomId: 'battle:battle-1', chats: [], attacks: [], defenses: [] },
    teamA: { roomId: 'battle:battle-1:A', chats: [], users: [], attacks: [], defenses: [] },
    teamB: { roomId: 'battle:battle-1:B', chats: [], users: [], attacks: [], defenses: [] },
    participants: new Map(),
    teamVotes: new Map(),
    userInfoMap: new Map(),
    opinionHistory: [],
    skipState: new Set(),
    round: 1,
    topics: [],
    totalRounds: 1,
    phase: BATTLE_PHASE.PENDING.name,
    phaseCount: 1,
    startedAt: null,
    expiredAt: null,
    ...overrides,
  })

  describe('BattlePhaseService', () => {
    it('PENDING?�서 OPINION_SHARE�??�환?�다', () => {
      const state = createState({ phase: BATTLE_PHASE.PENDING.name })
      const emitAttackedResult = jest.fn()
      const emitDefensedResult = jest.fn()
      const resetDiscussions = jest.fn()
      const finishBattle = jest.fn()
      const applyTeamVotes = jest.fn()

      const result = service.nextPhase(state, emitAttackedResult, emitDefensedResult, resetDiscussions, finishBattle, applyTeamVotes)

      expect(result).toBe(BATTLE_PHASE.OPINION_SHARE)
    })

    it('OPINION_SHARE?�서 ATTACK?�로 ?�환?�다', () => {
      const state = createState({ phase: BATTLE_PHASE.OPINION_SHARE.name })
      const emitAttackedResult = jest.fn()
      const emitDefensedResult = jest.fn()
      const resetDiscussions = jest.fn()
      const finishBattle = jest.fn()
      const applyTeamVotes = jest.fn()

      const result = service.nextPhase(state, emitAttackedResult, emitDefensedResult, resetDiscussions, finishBattle, applyTeamVotes)

      expect(result).toBe(BATTLE_PHASE.ATTACK)
      expect(state.expiredAt).toBeGreaterThan(Date.now())
    })

    it('ATTACK?�서 DEFENSE�??�환?�다', () => {
      const state = createState({ phase: BATTLE_PHASE.ATTACK.name })
      const emitAttackedResult = jest.fn()
      const emitDefensedResult = jest.fn()
      const resetDiscussions = jest.fn()
      const finishBattle = jest.fn()
      const applyTeamVotes = jest.fn()

      const result = service.nextPhase(state, emitAttackedResult, emitDefensedResult, resetDiscussions, finishBattle, applyTeamVotes)

      expect(result).toBe(BATTLE_PHASE.DEFENSE)
      expect(emitAttackedResult).toHaveBeenCalledWith(state)
      expect(resetDiscussions).toHaveBeenCalledWith(state)
    })

    it('DEFENSE?�서 ATTACK?�로 ?�환?�다 (phaseCount가 MAX보다 ?�을 ??', () => {
      const state = createState({ phase: BATTLE_PHASE.DEFENSE.name, phaseCount: 1 })
      const emitAttackedResult = jest.fn()
      const emitDefensedResult = jest.fn()
      const resetDiscussions = jest.fn()
      const finishBattle = jest.fn()
      const applyTeamVotes = jest.fn()

      const result = service.nextPhase(state, emitAttackedResult, emitDefensedResult, resetDiscussions, finishBattle, applyTeamVotes)

      expect(result).toBe(BATTLE_PHASE.ATTACK)
      expect(state.phaseCount).toBe(2)
      expect(emitDefensedResult).toHaveBeenCalledWith(state)
      expect(resetDiscussions).toHaveBeenCalledWith(state)
    })

    it('DEFENSE?�서 TEAM_SWITCH�??�환?�다 (phaseCount가 MAX????', () => {
      const state = createState({ phase: BATTLE_PHASE.DEFENSE.name, phaseCount: BATTLE_MAX_PHASE_COUNT })
      const emitAttackedResult = jest.fn()
      const emitDefensedResult = jest.fn()
      const resetDiscussions = jest.fn()
      const finishBattle = jest.fn()
      const applyTeamVotes = jest.fn()

      const result = service.nextPhase(state, emitAttackedResult, emitDefensedResult, resetDiscussions, finishBattle, applyTeamVotes)

      expect(result).toBe(BATTLE_PHASE.TEAM_SWITCH)
      expect(state.phaseCount).toBe(1)
    })

    it('TEAM_SWITCH?�서 OPINION_SHARE�??�환?�다 (?�음 ?�운?��? ?�을 ??', () => {
      const state = createState({ phase: BATTLE_PHASE.TEAM_SWITCH.name, round: 1, totalRounds: 2 })
      const emitAttackedResult = jest.fn()
      const emitDefensedResult = jest.fn()
      const resetDiscussions = jest.fn()
      const finishBattle = jest.fn()
      const applyTeamVotes = jest.fn()

      const result = service.nextPhase(state, emitAttackedResult, emitDefensedResult, resetDiscussions, finishBattle, applyTeamVotes)

      expect(result).toBe(BATTLE_PHASE.OPINION_SHARE)
      expect(applyTeamVotes).toHaveBeenCalledWith(state)
      expect(state.round).toBe(2)
    })

    it('TEAM_SWITCH?�서 null??반환?�다 (마�?�??�운?�일 ??', () => {
      const state = createState({ phase: BATTLE_PHASE.TEAM_SWITCH.name, round: 1, totalRounds: 1 })
      const emitAttackedResult = jest.fn()
      const emitDefensedResult = jest.fn()
      const resetDiscussions = jest.fn()
      const finishBattle = jest.fn()
      const applyTeamVotes = jest.fn()

      const result = service.nextPhase(state, emitAttackedResult, emitDefensedResult, resetDiscussions, finishBattle, applyTeamVotes)

      expect(result).toBeNull()
      expect(finishBattle).toHaveBeenCalledWith(state)
    })
  })

  describe('updateRound', () => {
    it('?�음 ?�운?�로 ?�데?�트?�다', () => {
      const state = createState({ round: 1, totalRounds: 2 })
      const finishBattle = jest.fn()

      const result = service.updateRound(state, finishBattle)

      expect(result).toBe(true)
      expect(state.round).toBe(2)
      expect(finishBattle).not.toHaveBeenCalled()
    })

    it('마�?�??�운?�면 finishBattle???�출?�고 false�?반환?�다', () => {
      const state = createState({ round: 1, totalRounds: 1 })
      const finishBattle = jest.fn()

      const result = service.updateRound(state, finishBattle)

      expect(result).toBe(false)
      expect(finishBattle).toHaveBeenCalledWith(state)
    })
  })
})
