import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import logout from '@/commons/apis/postLogout';
import { useAuthStore } from '@/commons/stores/authStore';
import { useToastStore, selectAddToast } from '@/commons/stores/toastStore';

export function useLogout() {
  const navigate = useNavigate();
  const addToast = useToastStore(selectAddToast);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: async () => {
      if (user?.type === 'oauth') {
        await logout();
      }
      clearAuth();
    },
    onSuccess: () => {
      navigate('/main');
    },
    onError: (error: Error) => {
      addToast({ message: error.message || '로그아웃에 실패했습니다.' });
    }
  });
}
