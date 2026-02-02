import type { BattleResultApiResponse } from './types';
import { isBattleResultApiResponse } from './types';

export async function getBattleResult(battleId: string): Promise<BattleResultApiResponse> {
  try {
    const response = await fetch(`/api/battles/${battleId}/result`);

    if (!response.ok) {
      throw new Error('배틀 결과를 불러오는데 실패했습니다.');
    }

    const data = await response.json();
    if (isBattleResultApiResponse(data)) {
      return data;
    }
    throw new Error('잘못된 배틀 결과 형식입니다.');
  } catch (error) {
    console.error('배틀 결과를 불러오는 중 오류 발생했습니다', error);
    throw error;
  }
}
