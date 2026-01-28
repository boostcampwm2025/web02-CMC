interface GuestLoginResponse {
  id: string;
  nickname: string;
}

function isGuestLoginResponse(data: unknown): data is GuestLoginResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'nickname' in data &&
    typeof (data as GuestLoginResponse).id === 'string' &&
    typeof (data as GuestLoginResponse).nickname === 'string'
  );
}

const fetchPostGuestLogin = async (battleId: string) => {
  const response = await fetch(`/api/auth/guest/${battleId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('비회원 로그인에 실패하였습니다.');
  }

  const data = await response.json();
  if (isGuestLoginResponse(data)) {
    return data;
  }
  throw new Error('잘못된 로그인 응답 형식입니다.');
};

export default fetchPostGuestLogin;
