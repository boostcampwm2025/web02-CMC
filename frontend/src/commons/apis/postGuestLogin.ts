import type { CreateGuestRequest } from '@cmc/types';

const fetchPostGuestLogin = async (battleId: string, nickname: string) => {
  const requestBody: CreateGuestRequest = { nickname };

  const response = await fetch(`/api/auth/guest/${battleId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error('닉네임이 중복되거나 로그인에 실패하였습니다.');
  }

  return response.json() as Promise<{
    id: string;
    nickname: string;
  }>;
};

export default fetchPostGuestLogin;
