import type { CreateBattleRequest, CreateBattleResponse } from './types';
import { isCreateBattleResponse } from './types';

const createBattle = async (battleData: CreateBattleRequest): Promise<CreateBattleResponse> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/battles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(battleData)
  });

  if (!response.ok) {
    throw new Error('배틀 생성에 실패했습니다.');
  }

  const data = await response.json();
  if (isCreateBattleResponse(data)) {
    return data;
  }
  throw new Error('잘못된 배틀 정보 형식입니다.');
};

export default createBattle;
