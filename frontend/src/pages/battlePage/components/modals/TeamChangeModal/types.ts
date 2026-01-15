import type { BattleDiscussion, BattleDefense } from '@/commons/types/battle';

/**
 * 단일 타임라인 메시지 컴포넌트 Props
 */
export interface TimelineMessageProps {
  message: BattleDiscussion | BattleDefense | null;
  team: 'A' | 'B';
  type: 'challenge' | 'rebuttal';
}

/**
 * 공수 전환 카드 컴포넌트 Props
 */
export interface PhaseFlowCardProps {
  turn: number;
  attackTeam: 'A' | 'B';
  defenseTeam: 'A' | 'B';
  attackMessage: BattleDiscussion | null;
  defenseMessage: BattleDefense | null;
}

/**
 * 타임라인 섹션 컴포넌트 Props
 */
export interface TimelineSectionProps {
  currentRound: number;
  timelines: {
    attacks: BattleDiscussion[];
    defenses: BattleDefense[];
  } | null;
}

/**
 * 투표 섹션 컴포넌트 Props
 */
export interface VotingSectionProps {
  currentTeam: 'A' | 'B' | 'NONE';
  teamACount: number;
  teamBCount: number;
  noneTeamCount: number;
  remainingTime: string;
  onTeamChange: (team: 'A' | 'B' | 'NONE') => void;
}
