import { useGetOpenBattles } from '../hooks/useGetOpenBattles';
import LiveBattleCard from './LiveBattleCard';

export default function LiveBattlesList() {
  const { battles: openBattles, isError, error } = useGetOpenBattles({ offset: 0, limit: 3 });

  if (isError) {
    throw error;
  }

  return (
    <div className="grid grid-cols-3 gap-4 h-[15rem]">
      {openBattles?.map((battleItem, index) => (
        <LiveBattleCard key={battleItem.id} battleInform={battleItem} isHot={index === 0} />
      ))}
    </div>
  );
}
