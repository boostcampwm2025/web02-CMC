import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { BattleSkipService } from './battleSkip.service'
import { ActiveBattleState } from '../models/types/battle.types'
import { BATTLE_PHASE, BATTLE_TEAM } from '../models/const/battles.const'

describe('BattleSkipService', () => {
  let service: BattleSkipService

  const createActiveState = (overrides: Partial<ActiveBattleState> = {}): ActiveBattleState => ({
    battleId: 'battle-id',
    all: { roomId: 'battle:battle-id', chats: [], attacks: [], defenses: [] },
    teamA: { roomId: 'battle:battle-id:A', chats: [], users: ['user-a'], attacks: [], defenses: [] },
    teamB: { roomId: 'battle:battle-id:B', chats: [], users: ['user-b'], attacks: [], defenses: [] },
    phase: BATTLE_PHASE.OPINION_SHARE.name,
    participants: new Map([
      ['user-a', BATTLE_TEAM.A],
      ['user-b', BATTLE_TEAM.B],
    ]),
    teamVotes: new Map(),
    userInfoMap: new Map(),
    opinionHistory: [],
    skipState: new Set<string>(),
    round: 0,
    topics: [],
    totalRounds: 0,
    phaseCount: 0,
    startedAt: null,
    expiredAt: null,
    ...overrides,
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BattleSkipService],
    }).compile()

    service = module.get(BattleSkipService)
  })

  describe('applyPhaseSkip', () => {
    it('TEAM_SWITCH 페이즈에서는 스킵할 수 없다', () => {
      const state = createActiveState({ phase: BATTLE_PHASE.TEAM_SWITCH.name })

      expect(() => {
        service.applyPhaseSkip(state, 'user-a', true)
      }).toThrow(BadRequestException)
      expect(() => {
        service.applyPhaseSkip(state, 'user-a', true)
      }).toThrow('진영선택 페이즈는 스킵이 불가합니다.')
    })

    it('중립(NONE) 유저는 스킵할 수 없다', () => {
      const state = createActiveState()
      state.participants.set('user-a', BATTLE_TEAM.NONE)

      expect(() => {
        service.applyPhaseSkip(state, 'user-a', true)
      }).toThrow(UnauthorizedException)
      expect(() => {
        service.applyPhaseSkip(state, 'user-a', true)
      }).toThrow('권한이 없습니다.')
    })

    it('skip=true면 skipState에 유저가 추가된다', () => {
      const state = createActiveState()

      service.applyPhaseSkip(state, 'user-a', true)

      expect(state.skipState.has('user-a')).toBe(true)
    })

    it('skip=false면 skipState에서 유저가 제거된다', () => {
      const state = createActiveState()

      service.applyPhaseSkip(state, 'user-a', true)

      service.applyPhaseSkip(state, 'user-a', false)

      expect(state.skipState.has('user-a')).toBe(false)
    })

    it('활성 참가자 수를 올바르게 계산한다', () => {
      const state = createActiveState()
      state.participants.set('user-none', BATTLE_TEAM.NONE)

      const count = service.buildActiveParticipantsCount(state)

      expect(count).toBe(2) // user-a, user-b만 카운트
    })

    it('스킵 카운트를 올바르게 계산한다', () => {
      const state = createActiveState()
      state.skipState.add('user-a')
      state.skipState.add('user-b')

      const count = service.buildSkipCount(false, state.skipState.size)

      expect(count).toBe(2)
    })
  })
})
