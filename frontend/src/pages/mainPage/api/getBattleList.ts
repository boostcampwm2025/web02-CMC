import type { BattleCardItem, ClosedBattleItem } from '../types/battle';

interface GetBattleListParams {
  offset: number;
  limit: number;
}

interface BattleListResponse {
  battles: BattleCardItem[];
  meta: {
    offset: number;
    limit: number;
    total: number;
  };
}

interface BattleResultListResponse {
  battles: ClosedBattleItem[];
  meta: {
    offset: number;
    limit: number;
    total: number;
  };
}

function isBattleListResponse(data: unknown): data is BattleListResponse {
  if (typeof data !== 'object' || data === null || !('battles' in data) || !('meta' in data)) {
    return false;
  }

  const obj = data as BattleListResponse;
  const meta = obj.meta;

  return (
    Array.isArray(obj.battles) &&
    typeof meta === 'object' &&
    meta !== null &&
    typeof meta.offset === 'number' &&
    typeof meta.limit === 'number' &&
    typeof meta.total === 'number'
  );
}

function isBattleResultListResponse(data: unknown): data is BattleResultListResponse {
  if (typeof data !== 'object' || data === null || !('battles' in data) || !('meta' in data)) {
    return false;
  }

  const obj = data as BattleResultListResponse;
  const meta = obj.meta;

  return (
    Array.isArray(obj.battles) &&
    typeof meta === 'object' &&
    meta !== null &&
    typeof meta.offset === 'number' &&
    typeof meta.limit === 'number' &&
    typeof meta.total === 'number'
  );
}

export async function getOpenBattles({ offset, limit }: GetBattleListParams): Promise<BattleListResponse> {
  const res = await fetch(`/api/battles/open?offset=${offset}&limit=${limit}`);

  if (!res.ok) {
    throw new Error('배틀 목록을 불러오지 못했습니다.');
  }

  const data = await res.json();
  if (isBattleListResponse(data)) {
    return data;
  }
  throw new Error('잘못된 배틀 목록 응답 형식입니다.');
}

export async function getClosedBattles({ offset, limit }: GetBattleListParams): Promise<BattleResultListResponse> {
  const res = await fetch(`/api/battles/closed?offset=${offset}&limit=${limit}`);

  if (!res.ok) {
    throw new Error('배틀 목록을 불러오지 못했습니다.');
  }

  const data = await res.json();
  if (isBattleResultListResponse(data)) {
    return data;
  }
  throw new Error('잘못된 배틀 목록 응답 형식입니다.');
}
