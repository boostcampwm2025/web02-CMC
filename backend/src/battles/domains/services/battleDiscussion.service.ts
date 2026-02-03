import { Injectable, BadRequestException } from '@nestjs/common'
import { ActiveBattleState, BattleDiscussion, BattleDefense, BattleTeam } from '../models/types/battle.types'
import { BATTLE_DISCUSSION_TYPE, BATTLE_TEAM, BATTLE_PHASE } from '../models/const/battles.const'

@Injectable()
export class BattleDiscussionService {
  // 공격 객체 생성
  buildAttack(discussionId: string, authorId: string, nickname: string, content: string, team: BattleTeam): BattleDiscussion {
    return {
      discussionId,
      author: {
        authorId,
        nickname,
      },
      type: BATTLE_DISCUSSION_TYPE.ATTACK,
      content: content.trim(),
      upvotes: 0,
      votes: [],
      status: 'PENDING',
      team,
    }
  }

  //방어 객체 생성
  buildDefense(discussionId: string, authorId: string, nickname: string, content: string, team: BattleTeam): BattleDefense {
    return {
      discussionId,
      author: {
        authorId,
        nickname,
      },
      type: BATTLE_DISCUSSION_TYPE.DEFENSE,
      content: content.trim(),
      upvotes: 0,
      votes: [],
      status: 'PENDING',
      team,
    }
  }

  // 공격 또는 방어 의견이 없을 때 생성
  buildNullPlaceholder(team: 'A' | 'B', type: 'ATTACK' | 'DEFENSE'): BattleDiscussion {
    const now = Date.now()
    const discussionId = `null-${team}-${type}-${now}`
    const teamValue = team === 'A' ? BATTLE_TEAM.A : BATTLE_TEAM.B

    const base =
      type === 'ATTACK'
        ? this.buildAttack(discussionId, '', '', '투표로 선정된 의견이 없습니다', teamValue)
        : this.buildDefense(discussionId, '', '', '투표로 선정된 의견이 없습니다', teamValue)

    return {
      ...base,
      status: 'SELECTED',
      selectedAt: now,
    }
  }

  // 공격 의견 상태 적용
  applyAttack(
    battleState: ActiveBattleState,
    authorId: string,
    content: string,
    team: BattleTeam,
    discussionId: string,
    getNickname: (userId: string) => string | null,
    canSubmit: (battleState: ActiveBattleState, team: BattleTeam) => boolean,
  ): BattleDiscussion {
    if (!canSubmit(battleState, team)) {
      throw new BadRequestException('현재 공격을 등록할 수 없는 단계입니다.')
    }

    const nickname = getNickname(authorId) || ''
    const attack = this.buildAttack(discussionId, authorId, nickname, content, team)

    battleState.opinionHistory.push(attack)
    if (team === BATTLE_TEAM.A) {
      battleState.teamA.attacks.push(attack)
    } else {
      battleState.teamB.attacks.push(attack)
    }

    return attack
  }

  // 방어 의견 상태 적용
  applyDefense(
    battleState: ActiveBattleState,
    authorId: string,
    content: string,
    team: BattleTeam,
    discussionId: string,
    getNickname: (userId: string) => string | null,
    canSubmit: (battleState: ActiveBattleState, team: BattleTeam) => boolean,
  ): BattleDefense {
    if (!canSubmit(battleState, team)) {
      throw new BadRequestException('현재 반론을 등록할 수 없는 단계입니다.')
    }

    const nickname = getNickname(authorId) || ''
    const defense = this.buildDefense(discussionId, authorId, nickname, content, team)

    battleState.opinionHistory.push(defense)
    if (team === BATTLE_TEAM.A) {
      battleState.teamA.defenses.push(defense)
    } else {
      battleState.teamB.defenses.push(defense)
    }

    return defense
  }

  // 의견 초기화
  resetDiscussions(state: ActiveBattleState): void {
    state.teamA.attacks = []
    state.teamB.attacks = []
    state.teamA.defenses = []
    state.teamB.defenses = []
  }

  //==============공격 의견 제출 가능 여부 확인=========
  canUserSubmitAttack(battleState: ActiveBattleState, userTeam: BattleTeam): boolean {
    const { phase } = battleState

    if (userTeam === BATTLE_TEAM.NONE) return false

    // OPINION_SHARE 단계에서는 모든 팀이 의견 제출 가능
    if (phase === BATTLE_PHASE.OPINION_SHARE.name || phase === BATTLE_PHASE.ATTACK.name) {
      return true
    }

    return false
  }

  canUserSubmitDefense(battleState: ActiveBattleState, userTeam: BattleTeam): boolean {
    const { phase } = battleState

    if (userTeam === BATTLE_TEAM.NONE) return false

    if (phase === BATTLE_PHASE.DEFENSE.name) {
      return true
    }

    return false
  }

  canUserVoteAttack(battleState: ActiveBattleState): boolean {
    return battleState.phase === BATTLE_PHASE.ATTACK.name
  }

  canUserVoteDefense(battleState: ActiveBattleState): boolean {
    return battleState.phase === BATTLE_PHASE.DEFENSE.name
  }
}
