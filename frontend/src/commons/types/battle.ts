// BattleChat 타입
export interface BattleChat {
  authorId: string;
  content: string;
}

export interface BattleInfo {
  title: string;
  description: string;
  aCode: string;
  bCode: string;
}

// BattleDiscussion 타입
export interface BattleDiscussion {
  discussionId: string;
  authorId: string;
  type: string;
  content: string;
  upvotes: number;
}

// BattleDefense 타입
export interface BattleDefense extends BattleDiscussion {
  attackId: string;
}

// BattleJoinResponseDto 타입
export interface BattleJoinData {
  battleId: string;
  counts: {
    teamA: number;
    teamB: number;
  };
  timelines: {
    attacks: BattleDiscussion[];
    defenses: BattleDefense[];
  };
  allChats: BattleChat[];
  attacks: BattleDiscussion[];
  defenses: BattleDefense[];
  chats: BattleChat[];
  participantId?: string;
}

export interface UseBattleSocketProps {
  battleId: string;
  userId: string;
  team: 'A' | 'B' | 'none';
  password?: string;
}
