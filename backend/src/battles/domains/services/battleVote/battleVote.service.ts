import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { ActiveBattleState, BattleDiscussion, BattleTeam, BattleTopOpinions } from '../../models/types/battle.types'
import { BATTLE_TEAM } from '../../models/const/battles.const'
import { DiscussionVoteResponseDto } from '../../../dto/discussionVoteResponse.dto'

@Injectable()
export class BattleVoteService {
  //공격 투표 적용
  applyAttackVote(
    battleState: ActiveBattleState,
    discussionId: string,
    userId: string,
    team: BattleTeam,
    canVote: (battleState: ActiveBattleState) => boolean,
  ): DiscussionVoteResponseDto[] {
    if (team === BATTLE_TEAM.NONE) {
      throw new ForbiddenException('중립 진영은 투표할 수 없습니다.')
    }

    if (!canVote(battleState)) {
      throw new BadRequestException('현재 투표할 수 있는 공격 턴이 아닙니다.')
    }

    const discussions = team === BATTLE_TEAM.A ? battleState.teamA.attacks : battleState.teamB.attacks

    const idx = discussions.findIndex(d => d?.discussionId === discussionId)
    if (idx === -1) {
      throw new NotFoundException('해당 진영의 이의제기 항목이 없습니다.')
    }

    const target = discussions[idx]
    if (!target) throw new NotFoundException('해당 항목이 존재하지 않습니다.')

    if (this.hasAlreadyVoted(target.votes, userId)) {
      throw new BadRequestException('이미 투표한 항목입니다.')
    }

    const updatedDiscussions: DiscussionVoteResponseDto[] = []

    // 다른 항목에 투표한 기록이 있으면 취소
    discussions.forEach((discussion, i) => {
      if (i !== idx && discussion && this.hasAlreadyVoted(discussion.votes, userId)) {
        const canceled = this.revokeVote(discussion, userId)
        discussions[i] = canceled
        this.syncOpinionHistory(battleState, discussion.discussionId, canceled)
        updatedDiscussions.push(DiscussionVoteResponseDto.of(battleState.battleId, canceled))
      }
    })

    // 새 항목에 투표 적용
    const updated = this.applyVote(target, userId)
    discussions[idx] = updated
    this.syncOpinionHistory(battleState, discussionId, updated)
    updatedDiscussions.push(DiscussionVoteResponseDto.of(battleState.battleId, updated))

    return updatedDiscussions
  }

  //반론 투표 적용
  applyDefenseVote(
    battleState: ActiveBattleState,
    discussionId: string,
    userId: string,
    team: BattleTeam,
    canVote: (battleState: ActiveBattleState) => boolean,
  ): DiscussionVoteResponseDto[] {
    if (team === BATTLE_TEAM.NONE) {
      throw new ForbiddenException('중립 진영은 투표할 수 없습니다.')
    }

    if (!canVote(battleState)) {
      throw new BadRequestException('현재 투표할 수 있는 반론 턴이 아닙니다.')
    }

    const discussions = team === BATTLE_TEAM.A ? battleState.teamA.defenses : battleState.teamB.defenses

    const idx = discussions.findIndex(d => d?.discussionId === discussionId)
    if (idx === -1) {
      throw new NotFoundException('해당 진영의 이의제기 항목이 없습니다.')
    }

    const target = discussions[idx]
    if (!target) throw new NotFoundException('해당 항목이 존재하지 않습니다.')

    if (this.hasAlreadyVoted(target.votes, userId)) {
      throw new BadRequestException('이미 투표한 항목입니다.')
    }

    const updatedDiscussions: DiscussionVoteResponseDto[] = []

    // 다른 항목에 투표한 기록이 있으면 취소
    discussions.forEach((discussion, i) => {
      if (i !== idx && discussion && this.hasAlreadyVoted(discussion.votes, userId)) {
        const canceled = this.revokeVote(discussion, userId)
        discussions[i] = canceled
        this.syncOpinionHistory(battleState, discussion.discussionId, canceled)
        updatedDiscussions.push(DiscussionVoteResponseDto.of(battleState.battleId, canceled))
      }
    })

    // 새 항목에 투표 적용
    const updated = this.applyVote(target, userId)
    discussions[idx] = updated
    this.syncOpinionHistory(battleState, discussionId, updated)
    updatedDiscussions.push(DiscussionVoteResponseDto.of(battleState.battleId, updated))

    return updatedDiscussions
  }

  //공격 투표 결과 계산
  buildAttackedResult(
    battleState: ActiveBattleState,
    createNullPlaceholder: (team: 'A' | 'B', type: 'ATTACK' | 'DEFENSE') => BattleDiscussion,
  ): BattleTopOpinions {
    // 페이즈 종료 시 각 팀의 투표 참가자 수 계산 및 의견에 기록
    this.applyVoterCountAtPhase(battleState.teamA.attacks, BATTLE_TEAM.A)
    this.applyVoterCountAtPhase(battleState.teamB.attacks, BATTLE_TEAM.B)

    const top = this.buildTopVotedAttack(battleState)

    const { aTeam, bTeam } = top
    const aEntry = aTeam ? aTeam : createNullPlaceholder('A', 'ATTACK')
    const bEntry = bTeam ? bTeam : createNullPlaceholder('B', 'ATTACK')
    battleState.all.attacks.push(aEntry)
    battleState.all.attacks.push(bEntry)

    return top
  }

  //반론 투표 결과 계산
  buildDefensedResult(
    battleState: ActiveBattleState,
    createNullPlaceholder: (team: 'A' | 'B', type: 'ATTACK' | 'DEFENSE') => BattleDiscussion,
  ): BattleTopOpinions {
    // 페이즈 종료 시 각 팀의 투표 참가자 수 계산 및 의견에 기록
    this.applyVoterCountAtPhase(battleState.teamA.defenses, BATTLE_TEAM.A)
    this.applyVoterCountAtPhase(battleState.teamB.defenses, BATTLE_TEAM.B)

    const top = this.buildTopVotedDefense(battleState)

    const { aTeam, bTeam } = top
    const aEntry = aTeam ? aTeam : createNullPlaceholder('A', 'DEFENSE')
    const bEntry = bTeam ? bTeam : createNullPlaceholder('B', 'DEFENSE')
    battleState.all.defenses.push(aEntry)
    battleState.all.defenses.push(bEntry)

    return top
  }

  private hasAlreadyVoted(votes: readonly string[], userId: string): boolean {
    return votes.includes(userId)
  }

  private applyVote<T extends { votes: string[]; upvotes: number }>(discussion: T, userId: string): T {
    return {
      ...discussion,
      votes: [...discussion.votes, userId],
      upvotes: discussion.upvotes + 1,
    }
  }

  private revokeVote<T extends { votes: string[]; upvotes: number }>(discussion: T, userId: string): T {
    return {
      ...discussion,
      votes: discussion.votes.filter(id => id !== userId),
      upvotes: discussion.upvotes - 1,
    }
  }

  private syncOpinionHistory(battleState: ActiveBattleState, discussionId: string, updated: BattleDiscussion): void {
    const idx = battleState.opinionHistory.findIndex(o => o.discussionId === discussionId)
    if (idx !== -1) {
      battleState.opinionHistory[idx] = updated
    }
  }

  private buildTopOpinion(opinions: (BattleDiscussion | null)[]): BattleDiscussion | null {
    const filteredOpinion = opinions.filter((opinion): opinion is BattleDiscussion => opinion !== null)

    // 의견이 없으면 null 반환
    if (filteredOpinion.length === 0) return null

    // 최고 득표 찾기
    const top = filteredOpinion.reduce((top, cur) => (cur.upvotes > top.upvotes ? cur : top))

    // 최고 득표가 0이면 null 반환 (아무도 투표하지 않음)
    if (top.upvotes === 0) return null

    // 선정된 의견의 status를 SELECTED로 변경
    top.status = 'SELECTED'
    top.selectedAt = Date.now()

    return top
  }

  private buildTopVotedAttack(state: ActiveBattleState): BattleTopOpinions {
    return {
      aTeam: this.buildTopOpinion(state.teamA.attacks),
      bTeam: this.buildTopOpinion(state.teamB.attacks),
    }
  }

  private buildTopVotedDefense(state: ActiveBattleState): BattleTopOpinions {
    return {
      aTeam: this.buildTopOpinion(state.teamA.defenses),
      bTeam: this.buildTopOpinion(state.teamB.defenses),
    }
  }

  private applyVoterCountAtPhase(opinions: (BattleDiscussion | null)[], team: BattleTeam): void {
    // 해당 팀의 이번 페이즈 투표 참가자 수 계산
    const allVoters = new Set<string>()
    opinions.forEach(o => {
      if (o && o.team === team) {
        o.votes.forEach(v => allVoters.add(v))
      }
    })
    const voterCount = allVoters.size

    // 각 의견에 투표 참가자 수 기록
    opinions.forEach(o => {
      if (o && o.team === team) {
        o.voterCountAtPhase = voterCount
      }
    })
  }
}
