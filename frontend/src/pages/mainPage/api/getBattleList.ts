import type { BattleListRequest } from '@cmc/types';
import type { BattleCardItem, ClosedBattleItem } from '../types/battle';

// 프론트엔드용 응답 타입 (백엔드 BattleListItemResponse를 BattleCardItem으로 변환)
interface OpenBattleListResponse {
  battles: BattleCardItem[];
  meta: {
    offset: number;
    limit: number;
    total: number;
  };
}

interface ClosedBattleListResponse {
  battles: ClosedBattleItem[];
  meta: {
    offset: number;
    limit: number;
    total: number;
  };
}

export async function getOpenBattles({ offset, limit }: BattleListRequest): Promise<OpenBattleListResponse> {
  const res = await fetch(`/api/battles/open?offset=${offset}&limit=${limit}`);

  if (!res.ok) {
    throw new Error('배틀 목록을 불러오지 못했습니다.');
  }

  return res.json();
}

export async function getClosedBattles({ offset, limit }: BattleListRequest): Promise<ClosedBattleListResponse> {
  const res = await fetch(`/api/battles/closed?offset=${offset}&limit=${limit}`);

  if (!res.ok) {
    throw new Error('배틀 목록을 불러오지 못했습니다.');
  }

  return res.json();
}
