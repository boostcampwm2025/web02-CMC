const refreshToken = async (): Promise<void> => {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('토큰 갱신에 실패했습니다.');
  }
};

export default refreshToken;
