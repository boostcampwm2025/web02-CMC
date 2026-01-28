import type { BattleLanguage, BattleType } from '@/pages/battleCreatePage/index';
import type { BattleCategory } from '@/pages/mainPage/types/battle';

type BattlePlayTimeName = 'FIFTEEN_MIN' | 'THIRTY_MIN';

export interface CreateBattleRequest {
  authorId: string;
  title: string;
  description: string;
  aCode: string;
  bCode: string;
  language: BattleLanguage;
  type: BattleType;
  category: BattleCategory;
  playTime: BattlePlayTimeName;
  topics: string[];
}

export interface CreateBattleResponse {
  battleId: string;
  inviteCode?: string;
}

function isCreateBattleResponse(data: unknown): data is CreateBattleResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as CreateBattleResponse;

  return typeof obj.battleId === 'string' && (obj.inviteCode === undefined || typeof obj.inviteCode === 'string');
}

const postCreateBattle = async (payload: CreateBattleRequest): Promise<CreateBattleResponse> => {
  try {
    const response = await fetch(`/api/battles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 쿠키 수신을 위해 필요
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(errorData?.message ?? '배틀 생성에 실패했습니다.');
    }

    const data = await response.json();
    if (isCreateBattleResponse(data)) {
      return data;
    }
    throw new Error('잘못된 응답 형식입니다.');
  } catch (error) {
    console.error('배틀 생성 중 오류 발생:', error);
    throw error;
  }
};

export default postCreateBattle;
