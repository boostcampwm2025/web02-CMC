import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import createBattle from '../api/createBattle';
import type { CreateBattleRequest } from '../api/types';
import { useToastStore, selectAddToast } from '@/commons/stores/toastStore';

export function useCreateBattle() {
  const navigate = useNavigate();
  const addToast = useToastStore(selectAddToast);

  const mutation = useMutation({
    mutationFn: (battleData: CreateBattleRequest) => {
      const processedData: CreateBattleRequest = {
        ...battleData,
        title: battleData.title.trim(),
        description: battleData.description.trim(),
        password: battleData.type === 'PRIVATE' ? battleData.password : undefined
      };
      return createBattle(processedData);
    },
    throwOnError: true,
    onSuccess: (data) => {
      navigate(`/battle/${data.battleId}/team-select/`);
    },
    onError: (error: Error) => {
      addToast({ message: error.message || '배틀 생성에 실패했습니다.' });
    }
  });

  return {
    createBattle: mutation.mutateAsync,
    isPending: mutation.isPending
  };
}
