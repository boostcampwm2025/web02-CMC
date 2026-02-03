import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { BattleVoteService } from './battleVote.service'
import { ActiveBattleState } from '../models/types/battle.types'
import { BATTLE_PHASE, BATTLE_TEAM, BATTLE_DISCUSSION_TYPE } from '../models/const/battles.const'

describe('BattleVoteService', () => {
  let service: BattleVoteService

  const createActiveState = (overrides: Partial<ActiveBattleState> = {}): ActiveBattleState => ({
    battleId: 'battle-1',
    all: { roomId: 'battle:battle-1', chats: [], attacks: [], defenses: [] },
    teamA: { roomId: 'battle:battle-1:A', chats: [], users: [], attacks: [], defenses: [] },
    teamB: { roomId: 'battle:battle-1:B', chats: [], users: [], attacks: [], defenses: [] },
    phase: BATTLE_PHASE.ATTACK.name,
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
      providers: [BattleVoteService],
    }).compile()

    service = module.get(BattleVoteService)
  })

  describe('applyAttackVote', () => {
    let state: ActiveBattleState

    beforeEach(() => {
      state = createActiveState({ battleId: 'battle-1' })
      state.phase = BATTLE_PHASE.ATTACK.name

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

    it('case', () => {
      const attack = state.teamA.attacks[0]!

      const result = service.applyAttackVote(
        state,
        attack.discussionId,
        'voter-1',
        BATTLE_TEAM.A,
        () => true, // canVote
      )
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(
        expect.objectContaining({
          discussionId: attack.discussionId,
          upvotes: 1,
          votes: ['voter-1'],
        }),
      )
    })

    it('case', () => {
      const attack = state.teamA.attacks[0]!

      service.applyAttackVote(state, attack.discussionId, 'voter-1', BATTLE_TEAM.A, () => true)

      expect(() => {
        service.applyAttackVote(state, attack.discussionId, 'voter-1', BATTLE_TEAM.A, () => true)
      }).toThrow(BadRequestException)
    })

    it('case', () => {
      const attack = state.teamA.attacks[0]!

      expect(() => {
        service.applyAttackVote(state, attack.discussionId, 'neutral', BATTLE_TEAM.NONE, () => true)
      }).toThrow(ForbiddenException)
    })

    it('case', () => {
      const attack = state.teamA.attacks[0]!

      expect(() => {
        service.applyDefenseVote(state, attack.discussionId, 'user', BATTLE_TEAM.A, () => false)
      }).toThrow(BadRequestException)
    })

    it('case', () => {
      expect(() => {
        service.applyAttackVote(state, 'invalid-id', 'user', BATTLE_TEAM.A, () => true)
      }).toThrow(NotFoundException)
    })
  })
})
