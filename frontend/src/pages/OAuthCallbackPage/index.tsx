import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/commons/stores/authStore';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const user = await useAuthStore.getState().getOAuthUser();

        if (!user) {
          navigate('/login', { replace: true });
          return;
        }

        const needsNickname =
          user.type === 'oauth' && (!user.nickname || user.nickname.trim() === '' || user.nickname === 'anonymous');

        navigate(needsNickname ? '/nickname' : '/', { replace: true });
      } catch {
        // 에러 발생 시 로그인 페이지로 리다이렉트
        navigate('/login', { replace: true });
      }
    })();
  }, [navigate]);

  return <div>로그인 처리중...</div>;
}
