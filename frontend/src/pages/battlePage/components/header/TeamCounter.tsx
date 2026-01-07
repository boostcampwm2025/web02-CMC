import { useBattleStore, selectTeamCounts } from '../../stores/battleStore';

export default function TeamCounter() {
  const { teamACount, teamBCount } = useBattleStore(selectTeamCounts);

  const teamNoneCounts = 0;

  return (
    <div className="flex items-center gap-8 min-w-[200px] justify-end">
      <div className="text-center">
        <div className="text-[46px] font-bold text-[#3B82F6]">{teamACount}</div>
        <div className="text-[12px] text-[#6A7282]">A팀</div>
      </div>
      <div className="text-center">
        <div className="text-[46px] font-bold text-[#6A7282]">{teamNoneCounts}</div>
        <div className="text-[12px] text-[#6A7282]">중립</div>
      </div>
      <div className="text-center">
        <div className="text-[46px] font-bold text-[#FF6467]">{teamBCount}</div>
        <div className="text-[12px] text-[#6A7282]">B팀</div>
      </div>
    </div>
  );
}
