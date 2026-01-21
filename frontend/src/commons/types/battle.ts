// @cmc/types에서 공통 타입 import
import type {
  BattlePhaseName,
  BattleTeam,
  BattleChat as BaseBattleChat,
  BattleDiscussion,
  BattleDefense as BaseBattleDefense,
  BattleChatScope,
  TeamCounts,
  TeamChange,
  BattleJoinResponse,
  BattleJoinInfoResponse
} from '@cmc/types';

// FE 전용 타입 정의 (기존 이름 유지를 위한 별칭)
export type BattlePhase = BattlePhaseName;
export type Team = BattleTeam;

// BattleInfo는 BattleJoinInfoResponse로 대체
export type BattleInfo = BattleJoinInfoResponse;

export interface BattleChat extends BaseBattleChat {
  type?: 'chat' | 'attack' | 'defense';
  votes?: number;
}

export interface BattleDefense extends BaseBattleDefense {
  attackId: string;
}

// BattleJoinResponse는 @cmc/types에서 import

export interface UseBattleSocketProps {
  battleId: string;
  userId: string;
  team: Team;
  password?: string;
}

export interface BattleProgressState {
  round: number;
  phase: BattlePhase;
  phaseCount: number;
  topic: string;
  startedAt: number | null;
  expiredAt: number | null;
}

// Battle:Attacked 이벤트 응답 타입
export interface DiscussionVoteResultItem {
  id: string | null;
  text: string | null;
  ownerId: string | null;
  nickname: string | null;
  count: number | null;
  team: Team | null;
}

export interface BattleAttackedResult {
  battleId: string;
  attack: {
    aTeam: DiscussionVoteResultItem;
    bTeam: DiscussionVoteResultItem;
  };
}

// Battle:Defensed 이벤트 응답 타입
export interface BattleDefensedResult {
  battleId: string;
  defense: {
    aTeam: DiscussionVoteResultItem;
    bTeam: DiscussionVoteResultItem;
  };
}

// 이펙트 타입
export type BattleEffectType = 'OBJECTION' | 'REVERSAL' | 'SURRENDER';

// battle:user:update 이벤트 응답
export interface BattleUserUpdateResponse {
  battleId: string;
  totalCount: number;
  counts: TeamCounts;
}

// battle:team:update:all 이벤트 응답
export interface BattleTeamUpdateAllResponse {
  battleId: string;
  round: number;
  before: TeamCounts;
  after: TeamCounts;
  changes: TeamChange[];
  difference: {
    teamA: number;
    teamB: number;
    teamNone: number;
  };
  dominantTeam: Team | null;
}
