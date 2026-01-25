import { useQuery } from '@tanstack/react-query';
import { getClosedBattles } from '../api/getClosedBattles';
import type { GetBattleListParams } from '../api/types';

export function useGetClosedBattles({ offset, limit }: GetBattleListParams) {
  return useQuery({
    queryKey: ['battles', 'closed', { offset, limit }],
    queryFn: () => getClosedBattles({ offset, limit }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10
  });
}
