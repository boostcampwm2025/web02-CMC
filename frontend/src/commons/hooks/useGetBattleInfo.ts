import { useQuery } from '@tanstack/react-query';
import getBattleInfo from '@/commons/apis/getBattleInfo';

export function useGetBattleInfo(battleId: string) {
  const { data, ...rest } = useQuery({
    queryKey: ['battle', 'info', battleId],
    queryFn: () => getBattleInfo(battleId),
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
    enabled: !!battleId
  });

  return {
    battleInfo: data,
    ...rest
  };
}
