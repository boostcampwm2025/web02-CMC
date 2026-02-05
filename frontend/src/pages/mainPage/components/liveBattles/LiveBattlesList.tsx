import { useGetOpenBattles } from '../../hooks/useGetOpenBattles';
import LiveBattleCard from './LiveBattleCard';
import EmptyBattlesState from '../EmptyBattlesState';

export default function LiveBattlesList() {
  const { battles: openBattles } = useGetOpenBattles({ offset: 0, limit: 3 });

  if (openBattles.length === 0) {
    return <EmptyBattlesState type="live" height="18rem" />;
  }

  return (
    <div className="grid grid-cols-3 gap-4 h-[18rem]">
      {openBattles.map((battleItem, index) => (
        <LiveBattleCard key={battleItem.id} battleInform={battleItem} isHot={index === 0} />
      ))}
    </div>
  );
}
