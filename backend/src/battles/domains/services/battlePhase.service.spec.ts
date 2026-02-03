import { Test, TestingModule } from '@nestjs/testing'
import { BattlePhaseService } from './battlePhase.service'
import { BATTLE_PHASE, BATTLE_MAX_PHASE_COUNT } from '../models/const/battles.const'
import { ActiveBattleState } from '../models/types/battle.types'

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
    it('PENDING에서 OPINION_SHARE로 전환한다', () => {
      const state = createState({ phase: BATTLE_PHASE.PENDING.name })
      const emitAttackedResult = jest.fn()
      const emitDefensedResult = jest.fn()
      const resetDiscussions = jest.fn()
      const finishBattle = jest.fn()
      const applyTeamVotes = jest.fn()

      const result = service.nextPhase(state, emitAttackedResult, emitDefensedResult, resetDiscussions, finishBattle, applyTeamVotes)

      expect(result).toBe(BATTLE_PHASE.OPINION_SHARE)
    })

    it('OPINION_SHARE에서 ATTACK으로 전환한다', () => {
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

    it('ATTACK에서 DEFENSE로 전환한다', () => {
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

    it('DEFENSE에서 ATTACK으로 전환한다 (phaseCount가 MAX보다 작을 때)', () => {
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

    it('DEFENSE에서 TEAM_SWITCH로 전환한다 (phaseCount가 MAX일 때)', () => {
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

    it('TEAM_SWITCH에서 OPINION_SHARE로 전환한다 (다음 라운드가 있을 때)', () => {
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

    it('TEAM_SWITCH에서 null을 반환한다 (마지막 라운드일 때)', () => {
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
    it('다음 라운드로 업데이트한다', async () => {
      const state = createState({ round: 1, totalRounds: 2 })
      const finishBattle = jest.fn()

      const result = service.updateRound(state, finishBattle)

      expect(result).toBe(true)
      expect(state.round).toBe(2)
      expect(finishBattle).not.toHaveBeenCalled()
    })

    it('마지막 라운드면 finishBattle을 호출하고 false를 반환한다', async () => {
      const state = createState({ round: 1, totalRounds: 1 })
      const finishBattle = jest.fn()

      const result = service.updateRound(state, finishBattle)

      expect(result).toBe(false)
      expect(finishBattle).toHaveBeenCalledWith(state)
    })
  })
})
