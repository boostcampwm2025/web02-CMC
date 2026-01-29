import { useGetClosedBattles } from '../hooks/useGetClosedBattles';
import PastBattleCard from './PastBattleCard';

export default function PastBattlesList() {
  const { battles: closedBattles, isError, error } = useGetClosedBattles({ offset: 0, limit: 6 });

  if (isError) {
    throw error;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {closedBattles?.map((b) => (
        <PastBattleCard key={b.id} item={b} />
      ))}
    </div>
  );
}
