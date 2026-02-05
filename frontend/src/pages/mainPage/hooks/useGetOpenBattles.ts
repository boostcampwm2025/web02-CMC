import { useSuspenseQuery } from '@tanstack/react-query';
import { getOpenBattles } from '../api/getOpenBattles';
import type { GetBattleListParams } from '../api/types';

export function useGetOpenBattles({ offset, limit }: GetBattleListParams) {
  const { data } = useSuspenseQuery({
    queryKey: ['battles', 'open', { offset, limit }],
    queryFn: () => getOpenBattles({ offset, limit }),
    select: (data) => ({
      battles: data.battles,
      total: data.meta.total
    }),
    staleTime: 0,
    gcTime: 1000 * 60 * 2,
    refetchInterval: 30000
  });

  return {
    battles: data.battles,
    total: data.total
  };
}
