import { useSuspenseQuery } from '@tanstack/react-query';
import { getBattleResult } from '../apis/getBattleResult';

export function useGetBattleResult(battleId: string) {
  const { data, ...rest } = useSuspenseQuery({
    queryKey: ['battle', 'result', battleId],
    queryFn: () => getBattleResult(battleId),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30
  });

  return {
    battleResult: data,
    ...rest
  };
}
