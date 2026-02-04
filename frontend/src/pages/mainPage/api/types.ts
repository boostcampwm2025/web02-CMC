import type { BattleCardItem, ClosedBattleItem } from '../types/battle';

export interface GetBattleListParams {
  offset: number;
  limit: number;
}

export interface BattleListResponse {
  battles: BattleCardItem[];
  meta: {
    offset: number;
    limit: number;
    total: number;
  };
}

export interface BattleResultListResponse {
  battles: ClosedBattleItem[];
  meta: {
    offset: number;
    limit: number;
    total: number;
  };
}

export function isBattleListResponse(data: unknown): data is BattleListResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  if (!('battles' in data) || !('meta' in data)) {
    return false;
  }

  const { battles, meta } = data;

  if (!Array.isArray(battles)) {
    return false;
  }

  if (typeof meta !== 'object' || meta === null) {
    return false;
  }

  if (!('offset' in meta) || !('limit' in meta) || !('total' in meta)) {
    return false;
  }

  return typeof meta.offset === 'number' && typeof meta.limit === 'number' && typeof meta.total === 'number';
}

export function isBattleResultListResponse(data: unknown): data is BattleResultListResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  if (!('battles' in data) || !('meta' in data)) {
    return false;
  }

  const { battles, meta } = data;

  if (!Array.isArray(battles)) {
    return false;
  }

  if (typeof meta !== 'object' || meta === null) {
    return false;
  }

  if (!('offset' in meta) || !('limit' in meta) || !('total' in meta)) {
    return false;
  }

  return typeof meta.offset === 'number' && typeof meta.limit === 'number' && typeof meta.total === 'number';
}
