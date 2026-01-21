import type { BattleDiscussion, DiscussionVoteResponse } from '@cmc/types'

export class DiscussionVoteResponseDto implements DiscussionVoteResponse {
  discussionId: string
  upvotes: number
  votes: string[]

  static fromEntity(battleId: string, discussion: BattleDiscussion): DiscussionVoteResponseDto {
    const dto = new DiscussionVoteResponseDto()

    dto.discussionId = discussion.discussionId
    dto.upvotes = discussion.upvotes
    dto.votes = [...discussion.votes]

    return dto
  }

  static of(battleId: string, discussion: BattleDiscussion): DiscussionVoteResponseDto {
    return this.fromEntity(battleId, discussion)
  }
}
