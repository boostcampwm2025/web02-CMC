import { type GetBattleListParams, type BattleResultListResponse, isBattleResultListResponse } from './types';

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
