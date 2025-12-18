interface VoteStatusProps {
  teamACounts: number;
  teamBCounts: number;
  teamNoneCounts: number;
}

export default function VoteStatus({ teamACounts, teamBCounts, teamNoneCounts }: VoteStatusProps) {
  const total = teamACounts + teamBCounts + teamNoneCounts;
  const aPercent = total > 0 ? (teamACounts / total) * 100 : 33.33;
  const nonePercent = total > 0 ? (teamNoneCounts / total) * 100 : 33.33;
  const bPercent = total > 0 ? (teamBCounts / total) * 100 : 33.33;

  return (
    <div className="border-[1px] border-[#2D2D3F] rounded-md px-4 py-2">
      <p className="text-[12px] text-[#99A1AF] mb-2 text-left">실시간 투표</p>
      <div className="flex items-center gap-3 mb-2">
        <div className="text-center">
          <p className="text-[16px] font-bold text-[#51A2FF]">{teamACounts}</p>
          <p className="text-[12px] text-[#99A1AF]">A</p>
        </div>
        <div className="text-center">
          <p className="text-[16px] font-bold text-[#99A1AF]">{teamNoneCounts}</p>
          <p className="text-[12px] text-[#99A1AF]">중립</p>
        </div>
        <div className="text-center">
          <p className="text-[16px] font-bold text-[#FF5A5F]">{teamBCounts}</p>
          <p className="text-[12px] text-[#99A1AF]">B</p>
        </div>
      </div>
      <div className="flex gap-0.5 h-1.5 w-[140px]">
        <div className="bg-[#51A2FF] rounded-full" style={{ width: `${aPercent}%` }} />
        <div className="bg-[#99A1AF] rounded-full" style={{ width: `${nonePercent}%` }} />
        <div className="bg-[#FF5A5F] rounded-full" style={{ width: `${bPercent}%` }} />
      </div>
    </div>
  );
}
