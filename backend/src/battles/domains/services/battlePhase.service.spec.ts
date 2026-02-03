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
    it('PENDING?ì„œ OPINION_SHAREë¡??„í™˜?œë‹¤', () => {
      const state = createState({ phase: BATTLE_PHASE.PENDING.name })
      const emitAttackedResult = jest.fn()
      const emitDefensedResult = jest.fn()
      const resetDiscussions = jest.fn()
      const finishBattle = jest.fn()
      const applyTeamVotes = jest.fn()

      const result = service.nextPhase(state, emitAttackedResult, emitDefensedResult, resetDiscussions, finishBattle, applyTeamVotes)

      expect(result).toBe(BATTLE_PHASE.OPINION_SHARE)
    })

    it('OPINION_SHARE?ì„œ ATTACK?¼ë¡œ ?„í™˜?œë‹¤', () => {
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

    it('ATTACK?ì„œ DEFENSEë¡??„í™˜?œë‹¤', () => {
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

    it('DEFENSE?ì„œ ATTACK?¼ë¡œ ?„í™˜?œë‹¤ (phaseCountê°€ MAXë³´ë‹¤ ?‘ì„ ??', () => {
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

    it('DEFENSE?ì„œ TEAM_SWITCHë¡??„í™˜?œë‹¤ (phaseCountê°€ MAX????', () => {
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

    it('TEAM_SWITCH?ì„œ OPINION_SHAREë¡??„í™˜?œë‹¤ (?¤ìŒ ?¼ìš´?œê? ?ˆì„ ??', () => {
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

    it('TEAM_SWITCH?ì„œ null??ë°˜í™˜?œë‹¤ (ë§ˆì?ë§??¼ìš´?œì¼ ??', () => {
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
    it('?¤ìŒ ?¼ìš´?œë¡œ ?…ë°?´íŠ¸?œë‹¤', () => {
      const state = createState({ round: 1, totalRounds: 2 })
      const finishBattle = jest.fn()

      const result = service.updateRound(state, finishBattle)

      expect(result).toBe(true)
      expect(state.round).toBe(2)
      expect(finishBattle).not.toHaveBeenCalled()
    })

    it('ë§ˆì?ë§??¼ìš´?œë©´ finishBattle???¸ì¶œ?˜ê³  falseë¥?ë°˜í™˜?œë‹¤', () => {
      const state = createState({ round: 1, totalRounds: 1 })
      const finishBattle = jest.fn()

      const result = service.updateRound(state, finishBattle)

      expect(result).toBe(false)
      expect(finishBattle).toHaveBeenCalledWith(state)
    })
  })
})
