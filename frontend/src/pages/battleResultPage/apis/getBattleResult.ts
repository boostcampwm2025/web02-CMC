import type { BattleResultResponse } from '@cmc/types';

export async function getBattleResult(battleId: string): Promise<BattleResultResponse> {
  const response = await fetch(`/api/battles/${battleId}/result`);

  if (!response.ok) {
    throw new Error('배틀 결과를 불러오는데 실패했습니다.');
  }

  return response.json();
}
