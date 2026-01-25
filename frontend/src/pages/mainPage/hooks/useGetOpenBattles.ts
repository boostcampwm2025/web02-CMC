import { useQuery } from '@tanstack/react-query';
import { getOpenBattles } from '../api/getOpenBattles';
import type { GetBattleListParams } from '../api/types';

export function useGetOpenBattles({ offset, limit }: GetBattleListParams) {
  return useQuery({
    queryKey: ['battles', 'open', { offset, limit }],
    queryFn: () => getOpenBattles({ offset, limit }),
    staleTime: 0,
    gcTime: 1000 * 60 * 2,
    refetchInterval: 30000,
    throwOnError: true
  });
}
