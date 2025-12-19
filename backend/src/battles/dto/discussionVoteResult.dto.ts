import { BattleDiscussion } from '../types/battles.types'

export class DiscussionVoteResultItemDto {
  id: string
  text: string
  ownerId: string
  count: number

  static fromEntity(discussion: BattleDiscussion): DiscussionVoteResultItemDto {
    const dto = new DiscussionVoteResultItemDto()

    dto.id = discussion.discussionId
    dto.text = discussion.content
    dto.ownerId = discussion.authorId
    dto.count = discussion.upvotes

    return dto
  }

  static of(discussion: BattleDiscussion): DiscussionVoteResultItemDto {
    return this.fromEntity(discussion)
  }
}

export class DiscussionVoteResultDto {
  battleId: string
  attack?: DiscussionVoteResultItemDto
  defense?: DiscussionVoteResultItemDto

  static attacked(battleId: string, discussion: BattleDiscussion): DiscussionVoteResultDto {
    const dto = new DiscussionVoteResultDto()
    dto.battleId = battleId
    dto.attack = DiscussionVoteResultItemDto.of(discussion)
    return dto
  }

  static defensed(battleId: string, discussion: BattleDiscussion): DiscussionVoteResultDto {
    const dto = new DiscussionVoteResultDto()
    dto.battleId = battleId
    dto.defense = DiscussionVoteResultItemDto.of(discussion)
    return dto
  }

  static of(battleId: string, discussion: BattleDiscussion): DiscussionVoteResultDto {
    return discussion.type === 'ATTACK' ? this.attacked(battleId, discussion) : this.defensed(battleId, discussion)
  }
}
