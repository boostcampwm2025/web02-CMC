import type { BattleDiscussion, BattleTeam } from '@cmc/types'
import type { BattleTopOpinions } from '../types/battles.types'

export class DiscussionVoteResultItemDto {
  id: string | null
  text: string | null
  ownerId: string | null
  nickname: string | null
  count: number | null
  team: BattleTeam | null

  static fromEntity(discussion: BattleDiscussion | null): DiscussionVoteResultItemDto {
    const dto = new DiscussionVoteResultItemDto()

    dto.id = discussion?.discussionId || null
    dto.text = discussion?.content || null
    dto.ownerId = discussion?.author?.authorId || null
    dto.nickname = discussion?.author?.nickname || null
    dto.count = discussion?.upvotes || null
    dto.team = discussion?.team || null

    return dto
  }

  static of(discussion: BattleDiscussion | null): DiscussionVoteResultItemDto {
    return this.fromEntity(discussion)
  }
}

export class DiscussionVoteResultDto {
  battleId: string
  attack?: { aTeam: DiscussionVoteResultItemDto; bTeam: DiscussionVoteResultItemDto }
  defense?: { aTeam: DiscussionVoteResultItemDto; bTeam: DiscussionVoteResultItemDto }

  static attacked(battleId: string, discussion: BattleTopOpinions): DiscussionVoteResultDto {
    const dto = new DiscussionVoteResultDto()
    dto.battleId = battleId
    dto.attack = {
      aTeam: DiscussionVoteResultItemDto.of(discussion.aTeam),
      bTeam: DiscussionVoteResultItemDto.of(discussion.bTeam),
    }
    return dto
  }

  static defensed(battleId: string, discussion: BattleTopOpinions): DiscussionVoteResultDto {
    const dto = new DiscussionVoteResultDto()
    dto.battleId = battleId
    dto.defense = {
      aTeam: DiscussionVoteResultItemDto.of(discussion.aTeam),
      bTeam: DiscussionVoteResultItemDto.of(discussion.bTeam),
    }
    return dto
  }

  static of(battleId: string, discussion: BattleTopOpinions): DiscussionVoteResultDto {
    const type = discussion.aTeam?.type || 'ATTACK'
    return type === 'ATTACK' ? this.attacked(battleId, discussion) : this.defensed(battleId, discussion)
  }
}
