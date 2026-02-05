import { useGetClosedBattles } from '../../hooks/useGetClosedBattles';
import PastBattleCard from './PastBattleCard';
import EmptyBattlesState from '../EmptyBattlesState';

export default function PastBattlesList() {
  const { battles: closedBattles } = useGetClosedBattles({ offset: 0, limit: 6 });

  if (closedBattles.length === 0) {
    return <EmptyBattlesState type="past" height="50rem" />;
  }

  return (
    <div className="grid grid-cols-3 gap-4 h-[50rem]">
      {closedBattles.map((b) => (
        <PastBattleCard key={b.id} item={b} />
      ))}
    </div>
  );
}
