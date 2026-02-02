import { Injectable, BadRequestException } from '@nestjs/common'
import { ActiveBattleState, BattleDiscussion, BattleDefense, BattleTeam } from '../types/battles.types'
import { BATTLE_DISCUSSION_TYPE, BATTLE_TEAM } from '../const/battles.const'

@Injectable()
export class BattleDiscussionHandler {
  createAttack(discussionId: string, authorId: string, nickname: string, content: string, team: BattleTeam): BattleDiscussion {
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

  createDefense(discussionId: string, authorId: string, nickname: string, content: string, team: BattleTeam): BattleDefense {
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

  handleAttack(
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
    const attack = this.createAttack(discussionId, authorId, nickname, content, team)

    battleState.opinionHistory.push(attack)
    if (team === BATTLE_TEAM.A) {
      battleState.teamA.attacks.push(attack)
    } else {
      battleState.teamB.attacks.push(attack)
    }

    return attack
  }

  handleDefense(
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
    const defense = this.createDefense(discussionId, authorId, nickname, content, team)

    battleState.opinionHistory.push(defense)
    if (team === BATTLE_TEAM.A) {
      battleState.teamA.defenses.push(defense)
    } else {
      battleState.teamB.defenses.push(defense)
    }

    return defense
  }

  resetDiscussions(state: ActiveBattleState): void {
    state.teamA.attacks = []
    state.teamB.attacks = []
    state.teamA.defenses = []
    state.teamB.defenses = []
  }

  createNullPlaceholder(team: 'A' | 'B', type: 'ATTACK' | 'DEFENSE'): BattleDiscussion {
    const now = Date.now()
    const discussionId = `null-${team}-${type}-${now}`
    const teamValue = team === 'A' ? BATTLE_TEAM.A : BATTLE_TEAM.B

    const base =
      type === 'ATTACK'
        ? this.createAttack(discussionId, '', '', '투표로 선정된 의견이 없습니다', teamValue)
        : this.createDefense(discussionId, '', '', '투표로 선정된 의견이 없습니다', teamValue)

    return {
      ...base,
      status: 'SELECTED',
      selectedAt: now,
    }
  }
}
