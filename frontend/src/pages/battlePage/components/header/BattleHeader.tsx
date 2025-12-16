import StatusCard from './StatusCard';
import VoteStatus from './VoteStatus';

interface BattleHeaderProps {
  title: string;
  description: string;
  status: string;
  timer: string;
  teamACounts: number;
  teamBCounts: number;
  teamNoneCounts: number;
}

export default function BattleHeader({
  title,
  description,
  status,
  timer,
  teamACounts,
  teamBCounts,
  teamNoneCounts
}: BattleHeaderProps) {
  return (
    <header className="bg-[#1E1E2F] px-8 py-6 rounded-lg mb-2">
      <div className="flex justify-between">
        <div>
          <h1 className="text-[20px] text-left font-bold mb-2">{title}</h1>
          <p className="text-[#99A1AF] text-[14px]">{description}</p>
        </div>
        <div className="flex items-center gap-4">
          <StatusCard turn={status} description={'주어진 시간 내에 코드의 문제점을 지적하세요'} timer={timer} />
          <VoteStatus teamACounts={teamACounts} teamBCounts={teamBCounts} teamNoneCounts={teamNoneCounts} />
        </div>
      </div>
    </header>
  );
}
