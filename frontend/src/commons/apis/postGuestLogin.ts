const fetchPostGuestLogin = async (battleId: string, nickname: string) => {
  const response = await fetch(`/api/auth/guest/${battleId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nickname })
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
