import { loginWithGitHub, loginWithKakao } from '@/commons/api/auth';
import { useToastStore, selectAddToast } from '@/commons/stores/toastStore';

export function useLoginHandlers() {
  const addToast = useToastStore(selectAddToast);

  const handleLogin = async (loginFn: () => Promise<void>) => {
    try {
      await loginFn();
    } catch (error) {
      addToast({ message: error instanceof Error ? error.message : '로그인에 실패했습니다.' });
    }
  };

  return {
    handleGitHubLogin: () => handleLogin(loginWithGitHub),
    handleKakaoLogin: () => handleLogin(loginWithKakao)
  };
}
