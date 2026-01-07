import { useBattleStore, selectTeamCounts } from '../../stores/battleStore';
import { useEffect, useState } from 'react';

export default function TeamCounter() {
  const { teamACount, teamBCount } = useBattleStore(selectTeamCounts);
  const [animateA, setAnimateA] = useState(false);
  const [animateB, setAnimateB] = useState(false);
  const [prevTeamACount, setPrevTeamACount] = useState(teamACount);
  const [prevTeamBCount, setPrevTeamBCount] = useState(teamBCount);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (teamACount > prevTeamACount) {
      setAnimateA(true);
      timeoutId = setTimeout(() => setAnimateA(false), 600);
    }
    setPrevTeamACount(teamACount);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [teamACount, prevTeamACount]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (teamBCount > prevTeamBCount) {
      setAnimateB(true);
      timeoutId = setTimeout(() => setAnimateB(false), 600);
    }
    setPrevTeamBCount(teamBCount);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [teamBCount, prevTeamBCount]);

  // @Todo  중립 팀 인원수 추가 로직 필요 현재는 임시적으로 0으로 고정하여 사용
  const teamNoneCounts = 0;

  return (
    <div className="flex items-center gap-8 min-w-[200px] justify-end">
      <div className="text-center">
        <div className={`text-[46px] font-bold text-[#3B82F6] ${animateA ? 'animate-bounce-scale' : ''}`}>
          {teamACount}
        </div>
        <div className="text-[12px] text-[#6A7282]">A팀</div>
      </div>
      <div className="text-center">
        <div className="text-[46px] font-bold text-[#6A7282]">{teamNoneCounts}</div>
        <div className="text-[12px] text-[#6A7282]">중립</div>
      </div>
      <div className="text-center">
        <div className={`text-[46px] font-bold text-[#FF6467] ${animateB ? 'animate-bounce-scale' : ''}`}>
          {teamBCount}
        </div>
        <div className="text-[12px] text-[#6A7282]">B팀</div>
      </div>
    </div>
  );
}
