import type { BattleInfo } from '@/commons/types/battle';

function isBattleInfo(data: unknown): data is BattleInfo {
  if (typeof data !== 'object' || data === null || !('timelines' in data)) {
    return false;
  }

  const obj = data as BattleInfo;
  const timelines = obj.timelines;

  return (
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.aCode === 'string' &&
    typeof obj.bCode === 'string' &&
    typeof obj.language === 'string' &&
    typeof obj.category === 'string' &&
    typeof obj.participantCount === 'number' &&
    typeof obj.currentRound === 'number' &&
    typeof obj.totalRounds === 'number' &&
    Array.isArray(obj.topics) &&
    typeof obj.currentPhase === 'string' &&
    typeof obj.phaseCount === 'number' &&
    typeof timelines === 'object' &&
    timelines !== null &&
    Array.isArray(timelines.attacks) &&
    Array.isArray(timelines.defenses) &&
    (obj.inviteCode === undefined || typeof obj.inviteCode === 'string')
  );
}

const getBattleInfo = async (id: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/battles/${id}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // 쿠키 포함
    });

    if (!response.ok) {
      if (response.status === 403) {
        alert('비공개 배틀에 접근하려면 초대 코드가 필요합니다.');
        window.location.href = '/';
        throw new Error('비공개 배틀에 접근하려면 초대 코드가 필요합니다.');
      }
      throw new Error('배틀 데이터를 불러오는데 실패했습니다.');
    }

    const data = await response.json();
    if (isBattleInfo(data)) {
      return data;
    }
    throw new Error('잘못된 배틀 정보 형식입니다.');
  } catch (error) {
    console.error('배틀 정보를 불러오는 중 오류 발생했습니다', error);
    throw error;
  }
};

export default getBattleInfo;
