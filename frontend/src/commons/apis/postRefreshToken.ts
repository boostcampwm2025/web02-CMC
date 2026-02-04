const refreshToken = async (): Promise<void> => {
  const VITE_API_URL = import.meta.env.VITE_API_URL ?? '';
  const response = await fetch(`${VITE_API_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('토큰 갱신에 실패했습니다.');
  }
};

export default refreshToken;
