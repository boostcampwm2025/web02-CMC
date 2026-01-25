import { useMutation } from '@tanstack/react-query';
import createBattle from '../api/createBattle';
import type { CreateBattleRequest } from '../api/types';

export function useCreateBattle() {
  const mutation = useMutation({
    mutationFn: (battleData: CreateBattleRequest) => {
      const processedData: CreateBattleRequest = {
        ...battleData,
        title: battleData.title.trim(),
        description: battleData.description.trim(),
        password: battleData.type === 'PRIVATE' ? battleData.password : undefined
      };
      return createBattle(processedData);
    }
  });

  return {
    createBattle: mutation.mutateAsync,
    isPending: mutation.isPending
  };
}
