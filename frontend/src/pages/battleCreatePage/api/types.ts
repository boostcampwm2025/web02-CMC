import type { BattleType, BattleLanguage } from '@cmc/types';
export type { BattleType, BattleLanguage };
export type BattlePlayTime = 'FIFTEEN_MIN' | 'THIRTY_MIN';

export interface CreateBattleRequest {
  authorId: string;
  title: string;
  description: string;
  aCode: string;
  bCode: string;
  language: BattleLanguage;
  type: BattleType;
  password?: string;
  category: string;
  playTime: BattlePlayTime;
  topics: string[];
}

export interface CreateBattleResponse {
  battleId: string;
  inviteCode?: string;
}

export function isCreateBattleResponse(data: unknown): data is CreateBattleResponse {
  if (typeof data !== 'object' || data === null) return false;

  const response = data as Record<string, unknown>;

  return typeof response.battleId === 'string' && response.battleId.length > 0;
}
