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

export async function getOpenBattles({ offset, limit }: GetBattleListParams): Promise<BattleListResponse> {
  const res = await fetch(`/api/battles/open?offset=${offset}&limit=${limit}`);

  if (!res.ok) {
    throw new Error('배틀 목록을 불러오지 못했습니다.');
  }

  return res.json();
}

export async function getClosedBattles({ offset, limit }: GetBattleListParams): Promise<BattleResultListResponse> {
  const res = await fetch(`/api/battles/closed?offset=${offset}&limit=${limit}`);

  if (!res.ok) {
    throw new Error('배틀 목록을 불러오지 못했습니다.');
  }

  return res.json();
}
