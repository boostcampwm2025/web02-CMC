import StatusCard from './StatusCard';

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
          <div className="border-[1px] border-[#2D2D3F] rounded-md px-4 py-2 ">
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
              <div className="bg-[#51A2FF] rounded-full flex-1" />
              <div className="bg-[#99A1AF] rounded-full flex-1" />
              <div className="bg-[#FF5A5F] rounded-full flex-1" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
