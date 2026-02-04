import { BadRequestException } from '@nestjs/common'
import { BattleDiscussionService } from './battleDiscussion.service'
import { BATTLE_DISCUSSION_TYPE, BATTLE_TEAM, BATTLE_PHASE } from '../../models/const/battles.const'
import type { ActiveBattleState, BattleTeam, BattleDiscussion, BattleDefense } from '../../models/types/battle.types'

describe('BattleDiscussionService', () => {
  let service: BattleDiscussionService

  beforeEach(() => {
    service = new BattleDiscussionService()
  })

  const createState = (phase: string): ActiveBattleState =>
    ({
      battleId: 'battle-1',
      phase,
      teamA: { attacks: [], defenses: [], users: [], chats: [], roomId: 'r-a' },
      teamB: { attacks: [], defenses: [], users: [], chats: [], roomId: 'r-b' },
      all: { attacks: [], defenses: [], chats: [], roomId: 'r-all' },
      opinionHistory: [],
      participants: new Map(),
      teamVotes: new Map(),
      userInfoMap: new Map([['user-1', '테스터']]),
      skipState: new Set(),
    }) as unknown as ActiveBattleState

  describe('buildAttack', () => {
    it('공격 객체를 생성한다', () => {
      const attack = service.buildAttack('d-1', 'user-1', '테스터', '  내용  ', BATTLE_TEAM.A)
      expect(attack.discussionId).toBe('d-1')
      expect(attack.author.authorId).toBe('user-1')
      expect(attack.author.nickname).toBe('테스터')
      expect(attack.type).toBe(BATTLE_DISCUSSION_TYPE.ATTACK)
      expect(attack.content).toBe('내용')
      expect(attack.upvotes).toBe(0)
      expect(attack.votes).toEqual([])
      expect(attack.status).toBe('PENDING')
      expect(attack.team).toBe(BATTLE_TEAM.A)
    })
  })

  describe('buildDefense', () => {
    it('방어 객체를 생성한다', () => {
      const defense = service.buildDefense('d-2', 'user-1', '테스터', '반론 내용', BATTLE_TEAM.B)
      expect(defense.type).toBe(BATTLE_DISCUSSION_TYPE.DEFENSE)
      expect(defense.team).toBe(BATTLE_TEAM.B)
    })
  })

  describe('buildNullPlaceholder', () => {
    it('팀A 공격 플레이스홀더를 생성한다', () => {
      const placeholder = service.buildNullPlaceholder('A', 'ATTACK')
      expect(placeholder.status).toBe('SELECTED')
      expect(placeholder.selectedAt).toBeDefined()
      expect(placeholder.content).toBe('투표로 선정된 의견이 없습니다')
      expect(placeholder.team).toBe(BATTLE_TEAM.A)
    })

    it('팀B 방어 플레이스홀더를 생성한다', () => {
      const placeholder = service.buildNullPlaceholder('B', 'DEFENSE')
      expect(placeholder.team).toBe(BATTLE_TEAM.B)
    })
  })

  describe('applyAttack', () => {
    it('공격 의견을 상태에 적용한다', () => {
      const state = createState(BATTLE_PHASE.ATTACK.name)
      const getNickname = jest.fn().mockReturnValue('테스터')
      const canSubmit = jest.fn().mockReturnValue(true)

      const attack = service.applyAttack(state, 'user-1', '공격 내용', BATTLE_TEAM.A, 'd-1', getNickname, canSubmit)

      expect(attack.content).toBe('공격 내용')
      expect(state.teamA.attacks).toHaveLength(1)
      expect(state.opinionHistory).toHaveLength(1)
    })

    it('팀B 공격은 teamB에 추가된다', () => {
      const state = createState(BATTLE_PHASE.ATTACK.name)
      const getNickname = jest.fn().mockReturnValue('테스터')
      const canSubmit = jest.fn().mockReturnValue(true)

      service.applyAttack(state, 'user-1', '공격', BATTLE_TEAM.B, 'd-1', getNickname, canSubmit)
      expect(state.teamB.attacks).toHaveLength(1)
    })

    it('canSubmit이 false면 BadRequestException을 던진다', () => {
      const state = createState(BATTLE_PHASE.PENDING.name)
      const getNickname = jest.fn().mockReturnValue('테스터')
      const canSubmit = jest.fn().mockReturnValue(false)

      expect(() => service.applyAttack(state, 'user-1', '공격', BATTLE_TEAM.A, 'd-1', getNickname, canSubmit)).toThrow(BadRequestException)
    })
  })

  describe('applyDefense', () => {
    it('반론 의견을 상태에 적용한다', () => {
      const state = createState(BATTLE_PHASE.DEFENSE.name)
      const getNickname = jest.fn().mockReturnValue('테스터')
      const canSubmit = jest.fn().mockReturnValue(true)

      const defense = service.applyDefense(state, 'user-1', '반론 내용', BATTLE_TEAM.A, 'd-1', getNickname, canSubmit)

      expect(defense.content).toBe('반론 내용')
      expect(state.teamA.defenses).toHaveLength(1)
    })

    it('팀B 반론은 teamB에 추가된다', () => {
      const state = createState(BATTLE_PHASE.DEFENSE.name)
      const getNickname = jest.fn().mockReturnValue('테스터')
      const canSubmit = jest.fn().mockReturnValue(true)

      service.applyDefense(state, 'user-1', '반론', BATTLE_TEAM.B, 'd-1', getNickname, canSubmit)
      expect(state.teamB.defenses).toHaveLength(1)
    })

    it('canSubmit이 false면 BadRequestException을 던진다', () => {
      const state = createState(BATTLE_PHASE.PENDING.name)
      const getNickname = jest.fn().mockReturnValue('')
      const canSubmit = jest.fn().mockReturnValue(false)

      expect(() => service.applyDefense(state, 'user-1', '반론', BATTLE_TEAM.A, 'd-1', getNickname, canSubmit)).toThrow(BadRequestException)
    })
  })

  describe('resetDiscussions', () => {
    it('모든 토론 데이터를 초기화한다', () => {
      const state = createState(BATTLE_PHASE.ATTACK.name)
      state.teamA.attacks = [{ discussionId: '1' } as BattleDiscussion]
      state.teamB.defenses = [{ discussionId: '2' } as BattleDefense]

      service.resetDiscussions(state)

      expect(state.teamA.attacks).toHaveLength(0)
      expect(state.teamB.attacks).toHaveLength(0)
      expect(state.teamA.defenses).toHaveLength(0)
      expect(state.teamB.defenses).toHaveLength(0)
    })
  })

  describe('canUserSubmitAttack', () => {
    it('OPINION_SHARE 단계에서 true를 반환한다', () => {
      const state = createState(BATTLE_PHASE.OPINION_SHARE.name)
      expect(service.canUserSubmitAttack(state, BATTLE_TEAM.A)).toBe(true)
    })

    it('ATTACK 단계에서 true를 반환한다', () => {
      const state = createState(BATTLE_PHASE.ATTACK.name)
      expect(service.canUserSubmitAttack(state, BATTLE_TEAM.B)).toBe(true)
    })

    it('NONE 팀은 false를 반환한다', () => {
      const state = createState(BATTLE_PHASE.ATTACK.name)
      expect(service.canUserSubmitAttack(state, BATTLE_TEAM.NONE as BattleTeam)).toBe(false)
    })

    it('다른 단계에서는 false를 반환한다', () => {
      const state = createState(BATTLE_PHASE.DEFENSE.name)
      expect(service.canUserSubmitAttack(state, BATTLE_TEAM.A)).toBe(false)
    })
  })

  describe('canUserSubmitDefense', () => {
    it('DEFENSE 단계에서 true를 반환한다', () => {
      const state = createState(BATTLE_PHASE.DEFENSE.name)
      expect(service.canUserSubmitDefense(state, BATTLE_TEAM.A)).toBe(true)
    })

    it('NONE 팀은 false를 반환한다', () => {
      const state = createState(BATTLE_PHASE.DEFENSE.name)
      expect(service.canUserSubmitDefense(state, BATTLE_TEAM.NONE as BattleTeam)).toBe(false)
    })

    it('다른 단계에서는 false를 반환한다', () => {
      const state = createState(BATTLE_PHASE.ATTACK.name)
      expect(service.canUserSubmitDefense(state, BATTLE_TEAM.A)).toBe(false)
    })
  })

  describe('canUserVoteAttack', () => {
    it('ATTACK 단계에서 true를 반환한다', () => {
      const state = createState(BATTLE_PHASE.ATTACK.name)
      expect(service.canUserVoteAttack(state)).toBe(true)
    })

    it('다른 단계에서는 false를 반환한다', () => {
      const state = createState(BATTLE_PHASE.DEFENSE.name)
      expect(service.canUserVoteAttack(state)).toBe(false)
    })
  })

  describe('canUserVoteDefense', () => {
    it('DEFENSE 단계에서 true를 반환한다', () => {
      const state = createState(BATTLE_PHASE.DEFENSE.name)
      expect(service.canUserVoteDefense(state)).toBe(true)
    })

    it('다른 단계에서는 false를 반환한다', () => {
      const state = createState(BATTLE_PHASE.ATTACK.name)
      expect(service.canUserVoteDefense(state)).toBe(false)
    })
  })
})
