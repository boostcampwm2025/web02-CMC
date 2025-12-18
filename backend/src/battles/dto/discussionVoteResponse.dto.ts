import { BattleDiscussion } from '../types/battles.types'

export class DiscussionVoteResponseDto {
  discussionId: string
  upvotes: number

  static fromEntity(discussion: BattleDiscussion): DiscussionVoteResponseDto {
    const dto = new DiscussionVoteResponseDto()
    dto.discussionId = discussion.discussionId
    dto.upvotes = discussion.upvotes
    return dto
  }
}
