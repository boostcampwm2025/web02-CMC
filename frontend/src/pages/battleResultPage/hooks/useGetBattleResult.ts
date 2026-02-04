import { useQuery } from '@tanstack/react-query';
import { getBattleResult } from '../apis/getBattleResult';

export function useGetBattleResult(battleId: string) {
  const { data, ...rest } = useQuery({
    queryKey: ['battle', 'result', battleId],
    queryFn: () => getBattleResult(battleId),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    enabled: !!battleId,
    throwOnError: true
  });

  return {
    battleResult: data,
    ...rest
  };
}
