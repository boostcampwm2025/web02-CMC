async function loginWithProvider(provider: 'github' | 'kakao'): Promise<void> {
  const controller = new AbortController();
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/${provider}`, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal
    });

    if (response.type === 'opaqueredirect' || response.ok || (response.status >= 300 && response.status < 400)) {
      window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/${provider}`;
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

export const loginWithGitHub = () => loginWithProvider('github');
export const loginWithKakao = () => loginWithProvider('kakao');
