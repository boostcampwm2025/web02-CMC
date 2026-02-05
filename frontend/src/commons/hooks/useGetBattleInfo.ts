import { useSuspenseQuery } from '@tanstack/react-query';
import getBattleInfo from '@/commons/apis/getBattleInfo';

export function useGetBattleInfo(battleId: string) {
  const { data, ...rest } = useSuspenseQuery({
    queryKey: ['battle', 'info', battleId],
    queryFn: () => getBattleInfo(battleId),
    staleTime: 0,
    gcTime: 1000 * 60 * 5
  });

  return {
    battleInfo: data,
    ...rest
  };
}
