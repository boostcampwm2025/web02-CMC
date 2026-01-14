import { useMemo, useState } from 'react';
import { useBattleStore, selectTimelines, selectBattleProgress } from '../../../stores/battleStore';
import RoundHeader from './RoundHeader';
import PhaseCard from './PhaseCard';
import PhaseDivider from './PhaseDivider';

export default function SidebarTimelineSection() {
  const timelines = useBattleStore(selectTimelines);
  const battleProgress = useBattleStore(selectBattleProgress);
  const [expandedRounds, setExpandedRounds] = useState<Set<string>>(new Set(['1-1']));

  const attackList = timelines?.attacks || [];
  const defenseList = timelines?.defenses || [];
  const currentRound = battleProgress?.round || 1;
  const currentPhase = battleProgress?.phase;

  // 타임라인 데이터를 서브라운드(n-1, n-2) 단위로 그룹화 하는 로직
  const subRoundsData = useMemo(() => {
    const totalRounds = Math.max(Math.ceil(attackList.length / 4), Math.ceil(defenseList.length / 4), currentRound);

    return Array.from({ length: totalRounds }, (_, i) => {
      const round = i + 1;
      return [1, 2].map((subIndex) => {
        const baseIdx = i * 4 + (subIndex - 1) * 2;
        return {
          round: `${round}-${subIndex}`,
          challenge: {
            teamA: attackList[baseIdx] || null,
            teamB: attackList[baseIdx + 1] || null
          },
          rebuttal: {
            teamA: defenseList[baseIdx] || null,
            teamB: defenseList[baseIdx + 1] || null
          }
        };
      });
    }).flat();
  }, [attackList, defenseList, currentRound]);

  const toggleRound = (round: string) => {
    const newExpanded = new Set(expandedRounds);
    if (newExpanded.has(round)) {
      newExpanded.delete(round);
    } else {
      newExpanded.add(round);
    }
    setExpandedRounds(newExpanded);
  };

  return (
    <section className="p-4 overflow-y-auto max-h-[calc(100vh-100px)] custom-scrollbar">
      <div className="space-y-2">
        {subRoundsData.map((subRound) => {
          const isExpanded = expandedRounds.has(subRound.round);
          const [round, subIndex] = subRound.round.split('-').map(Number);
          const isActive =
            round === currentRound &&
            ((subIndex === 1 && currentPhase === 'ATTACK') || (subIndex === 2 && currentPhase === 'DEFENSE'));

          return (
            <div
              key={subRound.round}
              className={`bg-[#1a1a2e] rounded-lg border overflow-hidden ${isActive ? 'border-orange-500/50' : 'border-[#2d2d3f]'}`}
            >
              <RoundHeader
                round={subRound.round}
                isActive={isActive}
                isExpanded={isExpanded}
                onToggle={() => toggleRound(subRound.round)}
              />

              {isExpanded && (
                <div className="border-t border-[#2d2d3f]">
                  <PhaseCard
                    phase="attack-A"
                    challengeMessage={subRound.challenge.teamA}
                    rebuttalMessage={subRound.rebuttal.teamB}
                  />
                  <PhaseDivider />
                  <PhaseCard
                    phase="attack-B"
                    challengeMessage={subRound.challenge.teamB}
                    rebuttalMessage={subRound.rebuttal.teamA}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
