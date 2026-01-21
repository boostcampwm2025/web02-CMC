// @cmc/types에서 공통 타입 import
import type {
  BattleChat as BaseBattleChat,
  BattleDefense as BaseBattleDefense,
  BattleTeam,
  BattlePhaseName
} from '@cmc/types';

// FE 전용 확장 타입
export interface BattleChat extends BaseBattleChat {
  type?: 'chat' | 'attack' | 'defense';
  votes?: number;
}

export interface BattleDefense extends BaseBattleDefense {
  attackId: string;
}

export interface UseBattleSocketProps {
  battleId: string;
  userId: string;
  team: BattleTeam;
  password?: string;
}

export interface BattleProgressState {
  round: number;
  phase: BattlePhaseName;
  phaseCount: number;
  topic: string;
  startedAt: number | null;
  expiredAt: number | null;
}

// 이펙트 타입
export type BattleEffectType = 'OBJECTION' | 'REVERSAL' | 'SURRENDER';
