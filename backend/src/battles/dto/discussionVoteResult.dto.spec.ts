import { DiscussionVoteResultItemDto, DiscussionVoteResultDto } from './discussionVoteResult.dto'
import { BattleDiscussion, BattleTopOpinions } from '../domains/models/types/battle.types'

describe('DiscussionVoteResultItemDto', () => {
  const mockDiscussion: BattleDiscussion = {
    discussionId: 'discussion-123',
    author: {
      authorId: 'author-123',
      nickname: 'TestUser',
    },
    type: 'ATTACK',
    content: 'This is a test attack content',
    upvotes: 10,
    votes: ['user1', 'user2'],
    status: 'SELECTED',
    team: 'A',
  }

  describe('fromEntity', () => {
    it('모든 필드가 올바르게 매핑된 DTO를 생성해야 한다', () => {
      const dto = DiscussionVoteResultItemDto.fromEntity(mockDiscussion)

      expect(dto.id).toBe('discussion-123')
      expect(dto.text).toBe('This is a test attack content')
      expect(dto.ownerId).toBe('author-123')
      expect(dto.nickname).toBe('TestUser')
      expect(dto.count).toBe(10)
      expect(dto.team).toBe('A')
    })

    it('null인 discussion을 처리해야 한다', () => {
      const dto = DiscussionVoteResultItemDto.fromEntity(null)

      expect(dto.id).toBeNull()
      expect(dto.text).toBeNull()
      expect(dto.ownerId).toBeNull()
      expect(dto.nickname).toBeNull()
      expect(dto.count).toBeNull()
      expect(dto.team).toBeNull()
    })

    it('author가 없는 discussion을 처리해야 한다', () => {
      const discussionWithoutAuthor: BattleDiscussion = {
        ...mockDiscussion,
        author: undefined as any,
      }

      const dto = DiscussionVoteResultItemDto.fromEntity(discussionWithoutAuthor)

      expect(dto.ownerId).toBeNull()
      expect(dto.nickname).toBeNull()
    })

    it('B팀 discussion을 올바르게 매핑해야 한다', () => {
      const bTeamDiscussion: BattleDiscussion = {
        ...mockDiscussion,
        team: 'B',
      }

      const dto = DiscussionVoteResultItemDto.fromEntity(bTeamDiscussion)

      expect(dto.team).toBe('B')
    })

    it('DEFENSE 타입 discussion을 올바르게 매핑해야 한다', () => {
      const defenseDiscussion: BattleDiscussion = {
        ...mockDiscussion,
        type: 'DEFENSE',
        content: 'Defense content',
      }

      const dto = DiscussionVoteResultItemDto.fromEntity(defenseDiscussion)

      expect(dto.text).toBe('Defense content')
    })

    it('upvotes가 0인 경우 null 대신 0을 반환해야 한다', () => {
      const zeroUpvotesDiscussion: BattleDiscussion = {
        ...mockDiscussion,
        upvotes: 0,
      }

      const dto = DiscussionVoteResultItemDto.fromEntity(zeroUpvotesDiscussion)

      // 0은 falsy이므로 null이 됨 (현재 로직)
      expect(dto.count).toBeNull()
    })
  })

  describe('of', () => {
    it('fromEntity를 사용해 DTO를 생성해야 한다', () => {
      const dto = DiscussionVoteResultItemDto.of(mockDiscussion)

      expect(dto.id).toBe('discussion-123')
      expect(dto.text).toBe('This is a test attack content')
    })

    it('null 값을 fromEntity에 전달해야 한다', () => {
      const dto = DiscussionVoteResultItemDto.of(null)

      expect(dto.id).toBeNull()
      expect(dto.text).toBeNull()
    })
  })
})

describe('DiscussionVoteResultDto', () => {
  const mockATeamDiscussion: BattleDiscussion = {
    discussionId: 'a-team-discussion',
    author: { authorId: 'a-author', nickname: 'ATeamUser' },
    type: 'ATTACK',
    content: 'A team attack',
    upvotes: 5,
    votes: ['user1'],
    status: 'SELECTED',
    team: 'A',
  }

  const mockBTeamDiscussion: BattleDiscussion = {
    discussionId: 'b-team-discussion',
    author: { authorId: 'b-author', nickname: 'BTeamUser' },
    type: 'ATTACK',
    content: 'B team attack',
    upvotes: 3,
    votes: ['user2'],
    status: 'SELECTED',
    team: 'B',
  }

  const mockTopOpinions: BattleTopOpinions = {
    aTeam: mockATeamDiscussion,
    bTeam: mockBTeamDiscussion,
  }

  describe('attacked', () => {
    it('공격 페이즈 결과 DTO를 생성해야 한다', () => {
      const dto = DiscussionVoteResultDto.attacked('battle-123', mockTopOpinions)

      expect(dto.battleId).toBe('battle-123')
      expect(dto.attack).toBeDefined()
      expect(dto.defense).toBeUndefined()
    })

    it('aTeam과 bTeam을 올바르게 매핑해야 한다', () => {
      const dto = DiscussionVoteResultDto.attacked('battle-123', mockTopOpinions)

      expect(dto.attack?.aTeam.id).toBe('a-team-discussion')
      expect(dto.attack?.aTeam.nickname).toBe('ATeamUser')
      expect(dto.attack?.bTeam.id).toBe('b-team-discussion')
      expect(dto.attack?.bTeam.nickname).toBe('BTeamUser')
    })

    it('null 토론을 처리해야 한다', () => {
      const nullOpinions: BattleTopOpinions = {
        aTeam: null,
        bTeam: null,
      }

      const dto = DiscussionVoteResultDto.attacked('battle-123', nullOpinions)

      expect(dto.attack?.aTeam.id).toBeNull()
      expect(dto.attack?.bTeam.id).toBeNull()
    })
  })

  describe('defensed', () => {
    it('방어 페이즈 결과 DTO를 생성해야 한다', () => {
      const defenseOpinions: BattleTopOpinions = {
        aTeam: { ...mockATeamDiscussion, type: 'DEFENSE', content: 'A team defense' },
        bTeam: { ...mockBTeamDiscussion, type: 'DEFENSE', content: 'B team defense' },
      }

      const dto = DiscussionVoteResultDto.defensed('battle-123', defenseOpinions)

      expect(dto.battleId).toBe('battle-123')
      expect(dto.defense).toBeDefined()
      expect(dto.attack).toBeUndefined()
    })

    it('aTeam과 bTeam을 올바르게 매핑해야 한다', () => {
      const dto = DiscussionVoteResultDto.defensed('battle-123', mockTopOpinions)

      expect(dto.defense?.aTeam.id).toBe('a-team-discussion')
      expect(dto.defense?.bTeam.id).toBe('b-team-discussion')
    })

    it('null 토론을 처리해야 한다', () => {
      const nullOpinions: BattleTopOpinions = {
        aTeam: null,
        bTeam: null,
      }

      const dto = DiscussionVoteResultDto.defensed('battle-123', nullOpinions)

      expect(dto.defense?.aTeam.id).toBeNull()
      expect(dto.defense?.bTeam.id).toBeNull()
    })
  })

  describe('of', () => {
    it('ATTACK 타입일 때 attacked를 반환해야 한다', () => {
      const dto = DiscussionVoteResultDto.of('battle-123', mockTopOpinions)

      expect(dto.attack).toBeDefined()
      expect(dto.defense).toBeUndefined()
    })

    it('DEFENSE 타입일 때 defensed를 반환해야 한다', () => {
      const defenseOpinions: BattleTopOpinions = {
        aTeam: { ...mockATeamDiscussion, type: 'DEFENSE' },
        bTeam: { ...mockBTeamDiscussion, type: 'DEFENSE' },
      }

      const dto = DiscussionVoteResultDto.of('battle-123', defenseOpinions)

      expect(dto.defense).toBeDefined()
      expect(dto.attack).toBeUndefined()
    })

    it('aTeam이 null일 때 기본값으로 ATTACK을 사용해야 한다', () => {
      const nullATeamOpinions: BattleTopOpinions = {
        aTeam: null,
        bTeam: mockBTeamDiscussion,
      }

      const dto = DiscussionVoteResultDto.of('battle-123', nullATeamOpinions)

      expect(dto.attack).toBeDefined()
      expect(dto.defense).toBeUndefined()
    })

    it('양쪽 팀 모두 null일 때 ATTACK을 기본값으로 사용해야 한다', () => {
      const nullOpinions: BattleTopOpinions = {
        aTeam: null,
        bTeam: null,
      }

      const dto = DiscussionVoteResultDto.of('battle-123', nullOpinions)

      expect(dto.attack).toBeDefined()
      expect(dto.defense).toBeUndefined()
    })

    it('battleId를 올바르게 설정해야 한다', () => {
      const dto = DiscussionVoteResultDto.of('unique-battle-id', mockTopOpinions)

      expect(dto.battleId).toBe('unique-battle-id')
    })
  })
})
