import { useGetClosedBattles } from '../hooks/useGetClosedBattles';
import PastBattleCard from './PastBattleCard';

export default function PastBattlesList() {
  const { battles: closedBattles } = useGetClosedBattles({ offset: 0, limit: 6 });

  return (
    <div className="grid grid-cols-3 gap-4 h-[36rem]">
      {closedBattles.map((b) => (
        <PastBattleCard key={b.id} item={b} />
      ))}
    </div>
  );
}
