import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import updateNickname from '@/commons/api/nickname';
import { useAuthStore } from '@/commons/stores/authStore';
import { useToastStore, selectAddToast } from '@/commons/stores/toastStore';

interface UseNicknameFormOptions {
  onSuccess: () => void;
}

export function useNicknameForm({ onSuccess }: UseNicknameFormOptions) {
  const [inputNickname, setInputNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const addToast = useToastStore(selectAddToast);

  const { mutate, isPending } = useMutation({
    mutationFn: (nickname: string) => updateNickname(nickname),
    onSuccess: () => {
      useAuthStore.setState({ user: null });
      useAuthStore.getState().getOAuthUser();
      onSuccess();
    },
    onError: (err: Error) => {
      addToast({ message: err.message || '닉네임 설정에 실패했습니다.' });
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputNickname(e.target.value);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    const trimmed = inputNickname.trim();
    if (trimmed.length > 8) {
      setError('닉네임은 8글자까지 가능합니다.');
      return;
    }
    setError(null);
    mutate(trimmed);
  };

  return { inputNickname, error, isPending, handleChange, handleSubmit };
}
