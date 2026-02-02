import { Injectable } from '@nestjs/common'
import { TimelineItem } from '../types/battleResult.types'
import { ActiveBattleState, BattleDiscussion } from '../types/battles.types'
import { BATTLE_TEAM } from '../const/battles.const'

@Injectable()
export class BattleTimelineBuilder {
  build(state: ActiveBattleState): TimelineItem[] {
    const toTimelineItem = (discussion: BattleDiscussion, index: number, type: 'ATTACK' | 'DEFENSE'): TimelineItem => {
      const createdAt = new Date(discussion.selectedAt ?? Date.now()).toISOString()
      return {
        id: discussion.discussionId,
        type,
        author: {
          id: discussion.author.authorId,
          nickname: discussion.author.nickname,
        },
        team: discussion.team === BATTLE_TEAM.A ? 'A' : discussion.team === BATTLE_TEAM.B ? 'B' : 'A',
        content: discussion.content,
        turn: Math.floor(index / 2) + 1,
        upvotes: discussion.upvotes,
        createdAt,
      }
    }

    const attacks = state.all.attacks
      .filter((discussion): discussion is BattleDiscussion => discussion !== null)
      .map((discussion, index) => toTimelineItem(discussion, index, 'ATTACK'))
    const defenses = state.all.defenses
      .filter((discussion): discussion is BattleDiscussion => discussion !== null)
      .map((discussion, index) => toTimelineItem(discussion, index, 'DEFENSE'))

    return [...attacks, ...defenses].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  normalize(timeline: unknown): TimelineItem[] {
    return Array.isArray(timeline) ? (timeline as TimelineItem[]) : []
  }
}
