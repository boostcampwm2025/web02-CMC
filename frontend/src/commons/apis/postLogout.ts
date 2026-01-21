interface LogoutResponse {
  success: boolean;
}

function isLogoutResponse(data: unknown): data is LogoutResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    typeof (data as LogoutResponse).success === 'boolean'
  );
}

const logout = async () => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('로그아웃에 실패했습니다.');
  }

  const data = await response.json();
  if (isLogoutResponse(data)) {
    return data;
  }
  throw new Error('잘못된 로그아웃 응답 형식입니다.');
};

export default logout;
