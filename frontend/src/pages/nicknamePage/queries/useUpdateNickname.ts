import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import updateOAuthNickname from '../apis/updateOAuthNickname';
import { useAuthStore } from '@/commons/stores/authStore';
import { useToastStore, selectAddToast } from '@/commons/stores/toastStore';

export function useUpdateNickname() {
  const navigate = useNavigate();
  const addToast = useToastStore(selectAddToast);

  return useMutation({
    mutationFn: (nickname: string) => updateOAuthNickname(nickname),
    throwOnError: true,
    onSuccess: () => {
      useAuthStore.setState({ user: null });
      navigate('/main');
    },
    onError: (error: Error) => {
      addToast({ message: error.message || '닉네임 설정에 실패했습니다.' });
    }
  });
}
