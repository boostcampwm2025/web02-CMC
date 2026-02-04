export async function loginWithKakao(): Promise<void> {
  try {
    const controller = new AbortController();

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/kakao`, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal
    });

    if (response.type === 'opaqueredirect' || response.ok || (response.status >= 300 && response.status < 400)) {
      window.location.href = '/api/auth/kakao';
    } else {
      throw new Error('서버 응답이 올바르지 않습니다.');
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
    }
    throw new Error('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
  }
}
