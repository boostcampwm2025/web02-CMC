import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { BattleVoteService } from './battleVote.service'
import { BATTLE_TEAM } from '../../models/const/battles.const'
import type { ActiveBattleState, BattleDiscussion, BattleTeam } from '../../models/types/battle.types'

describe('BattleVoteService', () => {
  let service: BattleVoteService

  beforeEach(() => {
    service = new BattleVoteService()
  })

  const createDiscussion = (id: string, votes: string[] = [], upvotes = 0, team: BattleTeam = BATTLE_TEAM.A): BattleDiscussion =>
    ({
      discussionId: id,
      author: { authorId: 'author-1', nickname: '작성자' },
      type: 'ATTACK',
      content: '내용',
      upvotes,
      votes,
      status: 'PENDING',
      team,
    }) as BattleDiscussion

  const createState = (teamAAttacks: (BattleDiscussion | null)[] = [], teamBAttacks: (BattleDiscussion | null)[] = []): ActiveBattleState =>
    ({
      battleId: 'battle-1',
      teamA: { attacks: teamAAttacks, defenses: [], users: ['user-1', 'user-2'] },
      teamB: { attacks: teamBAttacks, defenses: [], users: ['user-3'] },
      all: { attacks: [], defenses: [] },
      opinionHistory: [...teamAAttacks.filter(Boolean), ...teamBAttacks.filter(Boolean)] as BattleDiscussion[],
    }) as unknown as ActiveBattleState

  describe('applyAttackVote', () => {
    it('공격 의견에 투표한다', () => {
      const d1 = createDiscussion('d-1')
      const state = createState([d1])
      const canVote = jest.fn().mockReturnValue(true)

      const result = service.applyAttackVote(state, 'd-1', 'user-1', BATTLE_TEAM.A, canVote)

      expect(result).toHaveLength(1)
      expect(result[0].upvotes).toBe(1)
    })

    it('NONE 팀은 ForbiddenException을 던진다', () => {
      const state = createState()
      const canVote = jest.fn().mockReturnValue(true)

      expect(() => service.applyAttackVote(state, 'd-1', 'user-1', BATTLE_TEAM.NONE, canVote)).toThrow(ForbiddenException)
    })

    it('투표 불가 단계에서는 BadRequestException을 던진다', () => {
      const d1 = createDiscussion('d-1')
      const state = createState([d1])
      const canVote = jest.fn().mockReturnValue(false)

      expect(() => service.applyAttackVote(state, 'd-1', 'user-1', BATTLE_TEAM.A, canVote)).toThrow(BadRequestException)
    })

    it('존재하지 않는 의견에 투표하면 NotFoundException을 던진다', () => {
      const state = createState([createDiscussion('d-1')])
      const canVote = jest.fn().mockReturnValue(true)

      expect(() => service.applyAttackVote(state, 'nonexistent', 'user-1', BATTLE_TEAM.A, canVote)).toThrow(NotFoundException)
    })

    it('이미 투표한 의견에 다시 투표하면 BadRequestException을 던진다', () => {
      const d1 = createDiscussion('d-1', ['user-1'], 1)
      const state = createState([d1])
      const canVote = jest.fn().mockReturnValue(true)

      expect(() => service.applyAttackVote(state, 'd-1', 'user-1', BATTLE_TEAM.A, canVote)).toThrow(BadRequestException)
    })

    it('다른 의견에 투표한 기록이 있으면 이전 투표를 취소한다', () => {
      const d1 = createDiscussion('d-1', ['user-1'], 1)
      const d2 = createDiscussion('d-2')
      const state = createState([d1, d2])
      const canVote = jest.fn().mockReturnValue(true)

      const result = service.applyAttackVote(state, 'd-2', 'user-1', BATTLE_TEAM.A, canVote)

      expect(result).toHaveLength(2)
      const canceledDto = result.find(r => r.discussionId === 'd-1')
      const votedDto = result.find(r => r.discussionId === 'd-2')
      expect(canceledDto!.upvotes).toBe(0)
      expect(votedDto!.upvotes).toBe(1)
    })

    it('팀B 공격에도 투표할 수 있다', () => {
      const d1 = createDiscussion('d-1', [], 0, BATTLE_TEAM.B)
      const state = createState([], [d1])
      const canVote = jest.fn().mockReturnValue(true)

      const result = service.applyAttackVote(state, 'd-1', 'user-3', BATTLE_TEAM.B, canVote)
      expect(result).toHaveLength(1)
      expect(result[0].upvotes).toBe(1)
    })
  })

  describe('applyDefenseVote', () => {
    it('반론 의견에 투표한다', () => {
      const d1 = createDiscussion('d-1', [], 0, BATTLE_TEAM.A)
      const state = {
        ...createState(),
        teamA: { attacks: [], defenses: [d1], users: ['user-1'] },
        teamB: { attacks: [], defenses: [], users: [] },
        opinionHistory: [d1],
      } as unknown as ActiveBattleState
      const canVote = jest.fn().mockReturnValue(true)

      const result = service.applyDefenseVote(state, 'd-1', 'user-1', BATTLE_TEAM.A, canVote)

      expect(result).toHaveLength(1)
      expect(result[0].upvotes).toBe(1)
    })

    it('NONE 팀은 ForbiddenException을 던진다', () => {
      const state = createState()
      const canVote = jest.fn().mockReturnValue(true)

      expect(() => service.applyDefenseVote(state, 'd-1', 'user-1', BATTLE_TEAM.NONE, canVote)).toThrow(ForbiddenException)
    })

    it('투표 불가 단계에서는 BadRequestException을 던진다', () => {
      const d1 = createDiscussion('d-1')
      const state = {
        ...createState(),
        teamA: { attacks: [], defenses: [d1], users: ['user-1'] },
      } as unknown as ActiveBattleState
      const canVote = jest.fn().mockReturnValue(false)

      expect(() => service.applyDefenseVote(state, 'd-1', 'user-1', BATTLE_TEAM.A, canVote)).toThrow(BadRequestException)
    })
  })

  describe('buildAttackedResult', () => {
    it('각 팀의 최고 득표 공격을 선정한다', () => {
      const d1 = createDiscussion('d-1', ['user-1', 'user-2'], 2, BATTLE_TEAM.A)
      const d2 = createDiscussion('d-2', ['user-1'], 1, BATTLE_TEAM.A)
      const d3 = createDiscussion('d-3', ['user-3'], 1, BATTLE_TEAM.B)
      const state = createState([d1, d2], [d3])
      const createNullPlaceholder = jest.fn().mockReturnValue(createDiscussion('null-placeholder'))

      const result = service.buildAttackedResult(state, createNullPlaceholder)

      expect(result.aTeam).not.toBeNull()
      expect(result.aTeam!.discussionId).toBe('d-1')
      expect(result.aTeam!.status).toBe('SELECTED')
      expect(result.bTeam).not.toBeNull()
    })

    it('투표가 없으면 null을 반환하고 placeholder를 사용한다', () => {
      const d1 = createDiscussion('d-1', [], 0, BATTLE_TEAM.A)
      const state = createState([d1], [])
      const placeholder = createDiscussion('null', [], 0, BATTLE_TEAM.A)
      const createNullPlaceholder = jest.fn().mockReturnValue(placeholder)

      const result = service.buildAttackedResult(state, createNullPlaceholder)

      expect(result.aTeam).toBeNull()
      expect(createNullPlaceholder).toHaveBeenCalled()
      expect(state.all.attacks).toHaveLength(2)
    })

    it('의견이 아예 없으면 null placeholder를 사용한다', () => {
      const state = createState([], [])
      const placeholder = createDiscussion('null')
      const createNullPlaceholder = jest.fn().mockReturnValue(placeholder)

      const result = service.buildAttackedResult(state, createNullPlaceholder)

      expect(result.aTeam).toBeNull()
      expect(result.bTeam).toBeNull()
    })
  })

  describe('buildDefensedResult', () => {
    it('각 팀의 최고 득표 반론을 선정한다', () => {
      const d1 = createDiscussion('d-1', ['user-1'], 1, BATTLE_TEAM.A)
      const state = {
        ...createState(),
        battleId: 'battle-1',
        teamA: { attacks: [], defenses: [d1], users: ['user-1'] },
        teamB: { attacks: [], defenses: [], users: [] },
        all: { attacks: [], defenses: [] },
      } as unknown as ActiveBattleState
      const createNullPlaceholder = jest.fn().mockReturnValue(createDiscussion('null'))

      const result = service.buildDefensedResult(state, createNullPlaceholder)

      expect(result.aTeam).not.toBeNull()
      expect(result.aTeam!.status).toBe('SELECTED')
    })
  })
})
