import { BattleDiscussion } from '../types/battles.types'

export class DiscussionVoteResponseDto {
  battleId: string
  attackId?: string
  defenseId?: string
  count: number

  static fromEntity(battleId: string, discussion: BattleDiscussion): DiscussionVoteResponseDto {
    const dto = new DiscussionVoteResponseDto()

    dto.battleId = battleId
    dto.count = discussion.upvotes

    if (discussion.type === 'ATTACK') {
      dto.attackId = discussion.discussionId
    }

    if (discussion.type === 'DEFENSE') {
      dto.defenseId = discussion.discussionId
    }

    return dto
  }

  static of(battleId: string, discussion: BattleDiscussion): DiscussionVoteResponseDto {
    return this.fromEntity(battleId, discussion)
  }
}
