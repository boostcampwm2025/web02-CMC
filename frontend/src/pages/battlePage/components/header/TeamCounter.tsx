import { useBattleStore, selectTeamCounts } from '@/pages/battlePage/stores/battleStore';
import { useEffect, useState } from 'react';

export default function TeamCounter() {
  const { teamACount, teamBCount } = useBattleStore(selectTeamCounts);
  const [animateA, setAnimateA] = useState<'increase' | 'decrease' | null>(null);
  const [animateB, setAnimateB] = useState<'increase' | 'decrease' | null>(null);
  const [prevTeamACount, setPrevTeamACount] = useState(teamACount);
  const [prevTeamBCount, setPrevTeamBCount] = useState(teamBCount);

  useEffect(() => {
    if (teamACount === prevTeamACount) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let animationTimeoutId: ReturnType<typeof setTimeout>;

    if (teamACount > prevTeamACount) {
      setAnimateA(null);
      animationTimeoutId = setTimeout(() => {
        setAnimateA('increase');
        timeoutId = setTimeout(() => setAnimateA(null), 600);
      }, 10);
    } else if (teamACount < prevTeamACount) {
      setAnimateA(null);
      animationTimeoutId = setTimeout(() => {
        setAnimateA('decrease');
        timeoutId = setTimeout(() => setAnimateA(null), 800);
      }, 10);
    }
    setPrevTeamACount(teamACount);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(animationTimeoutId);
    };
  }, [teamACount]);

  useEffect(() => {
    if (teamBCount === prevTeamBCount) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let animationTimeoutId: ReturnType<typeof setTimeout>;

    if (teamBCount > prevTeamBCount) {
      setAnimateB(null);
      animationTimeoutId = setTimeout(() => {
        setAnimateB('increase');
        timeoutId = setTimeout(() => setAnimateB(null), 600);
      }, 10);
    } else if (teamBCount < prevTeamBCount) {
      setAnimateB(null);
      animationTimeoutId = setTimeout(() => {
        setAnimateB('decrease');
        timeoutId = setTimeout(() => setAnimateB(null), 800);
      }, 10);
    }
    setPrevTeamBCount(teamBCount);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(animationTimeoutId);
    };
  }, [teamBCount]);

  // @Todo  중립 팀 인원수 추가 로직 필요 현재는 임시적으로 0으로 고정하여 사용
  const teamNoneCounts = 0;

  return (
    <div className="flex items-center gap-8 min-w-[200px] justify-end">
      <div className="text-center">
        <div
          className={`text-[46px] font-bold text-[#3B82F6] ${
            animateA === 'increase' ? 'animate-bounce-scale' : animateA === 'decrease' ? 'animate-shake-fade-out' : ''
          }`}
        >
          {teamACount}
        </div>
        <div className="text-[12px] text-[#6A7282]">A팀</div>
      </div>
      <div className="text-center">
        <div className="text-[46px] font-bold text-[#6A7282]">{teamNoneCounts}</div>
        <div className="text-[12px] text-[#6A7282]">중립</div>
      </div>
      <div className="text-center">
        <div
          className={`text-[46px] font-bold text-[#FF6467] ${
            animateB === 'increase' ? 'animate-bounce-scale' : animateB === 'decrease' ? 'animate-shake-fade-out' : ''
          }`}
        >
          {teamBCount}
        </div>
        <div className="text-[12px] text-[#6A7282]">B팀</div>
      </div>
    </div>
  );
}
