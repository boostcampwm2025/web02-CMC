import { useQuery } from '@tanstack/react-query';
import { getClosedBattles } from '../api/getClosedBattles';
import type { GetBattleListParams } from '../api/types';

export function useGetClosedBattles({ offset, limit }: GetBattleListParams) {
  const { data, ...rest } = useQuery({
    queryKey: ['battles', 'closed', { offset, limit }],
    queryFn: () => getClosedBattles({ offset, limit }),
    select: (data) => ({
      battles: data.battles,
      total: data.meta.total
    }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    throwOnError: true
  });

  return {
    battles: data?.battles,
    total: data?.total,
    ...rest
  };
}
