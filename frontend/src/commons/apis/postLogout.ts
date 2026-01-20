const logout = async () => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('로그아웃에 실패했습니다.');
  }

  return response.json() as Promise<{ success: boolean }>;
};

export default logout;
