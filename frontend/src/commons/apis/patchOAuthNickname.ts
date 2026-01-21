interface OAuthUserResponse {
  id: string;
  nickname: string;
  avatarUrl: string;
}

const updateOAuthNickname = async (nickname: string): Promise<void> => {
  const response = await fetch('/api/auth/nickname', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ nickname })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || '닉네임 설정에 실패했습니다.');
  }

  const data: OAuthUserResponse = await response.json();

  if (!data || typeof data.id !== 'string' || typeof data.nickname !== 'string') {
    throw new Error('잘못된 응답 형식입니다.');
  }
};

export default updateOAuthNickname;
