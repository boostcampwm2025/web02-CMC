import { useBattleStore, selectTeamCounts } from '@/pages/battlePage/stores/battleStore';
import { useEffect, useState } from 'react';

export default function TeamCounter() {
  const { teamA, teamB, none } = useBattleStore(selectTeamCounts);
  const [animateA, setAnimateA] = useState<'increase' | 'decrease' | null>(null);
  const [animateB, setAnimateB] = useState<'increase' | 'decrease' | null>(null);
  const [prevTeamA, setPrevTeamA] = useState(teamA);
  const [prevTeamB, setPrevTeamB] = useState(teamB);

  useEffect(() => {
    if (teamA === prevTeamA) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let animationTimeoutId: ReturnType<typeof setTimeout>;

    if (teamA > prevTeamA) {
      setAnimateA(null);
      animationTimeoutId = setTimeout(() => {
        setAnimateA('increase');
        timeoutId = setTimeout(() => setAnimateA(null), 600);
      }, 10);
    } else if (teamA < prevTeamA) {
      setAnimateA(null);
      animationTimeoutId = setTimeout(() => {
        setAnimateA('decrease');
        timeoutId = setTimeout(() => setAnimateA(null), 800);
      }, 10);
    }
    setPrevTeamA(teamA);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(animationTimeoutId);
    };
  }, [teamA, prevTeamA]);

  useEffect(() => {
    if (teamB === prevTeamB) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let animationTimeoutId: ReturnType<typeof setTimeout>;

    if (teamB > prevTeamB) {
      setAnimateB(null);
      animationTimeoutId = setTimeout(() => {
        setAnimateB('increase');
        timeoutId = setTimeout(() => setAnimateB(null), 600);
      }, 10);
    } else if (teamB < prevTeamB) {
      setAnimateB(null);
      animationTimeoutId = setTimeout(() => {
        setAnimateB('decrease');
        timeoutId = setTimeout(() => setAnimateB(null), 800);
      }, 10);
    }
    setPrevTeamB(teamB);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(animationTimeoutId);
    };
  }, [teamB, prevTeamB]);

  return (
    <div className="flex items-center gap-8 max-w-xs" data-tutorial="team-status">
      <div className="text-center">
        <div
          className={`text-5xl font-bold text-[#3B82F6] ${
            animateA === 'increase' ? 'animate-bounce-scale' : animateA === 'decrease' ? 'animate-shake-fade-out' : ''
          }`}
        >
          {teamA}
        </div>
        <div className="text-xs text-[#6A7282]">A팀</div>
      </div>
      <div className="text-center">
        <div className="text-5xl font-bold text-[#6A7282]">{none}</div>
        <div className="text-xs text-[#6A7282]">중립</div>
      </div>
      <div className="text-center">
        <div
          className={`text-5xl font-bold text-[#FF6467] ${
            animateB === 'increase' ? 'animate-bounce-scale' : animateB === 'decrease' ? 'animate-shake-fade-out' : ''
          }`}
        >
          {teamB}
        </div>
        <div className="text-xs text-[#6A7282]">B팀</div>
      </div>
    </div>
  );
}
