import { useMemo, useState } from 'react';
import { useBattleStore, selectTimelines, selectBattleProgress } from '../../../stores/battleStore';
import RoundHeader from './RoundHeader';
import PhaseCard from './PhaseCard';
import PhaseDivider from './PhaseDivider';

interface SidebarTimelineSectionProps {
  isWide?: boolean;
  topics: string[];
}

const FIRST_SUB_ROUND = 1;
const SECOND_SUB_ROUND = 2;
const SUB_ROUNDS_PER_ROUND = [FIRST_SUB_ROUND, SECOND_SUB_ROUND];
const TEAMS_PER_SUB_ROUND = 2;
const DEFAULT_EXPANDED_ROUND = '1-1';

export default function SidebarTimelineSection({ isWide = false, topics }: SidebarTimelineSectionProps) {
  const timelines = useBattleStore(selectTimelines);
  const battleProgress = useBattleStore(selectBattleProgress);
  const [expandedRounds, setExpandedRounds] = useState<Set<string>>(new Set([DEFAULT_EXPANDED_ROUND]));

  const attackList = timelines?.attacks || [];
  const defenseList = timelines?.defenses || [];
  const currentRound = battleProgress?.round || 1;
  const currentPhase = battleProgress?.phase;
  const currentPhaseCount = battleProgress?.phaseCount || 1;

  // Active 상태 판단 로직
  const isSubRoundActive = (round: number, subIndex: number): boolean => {
    if (round !== currentRound) return false;

    if (currentPhase === 'ATTACK' || currentPhase === 'DEFENSE') {
      return subIndex === currentPhaseCount;
    }

    if (currentPhase === 'TEAM_SWITCH') {
      return subIndex === SECOND_SUB_ROUND;
    }

    return subIndex === FIRST_SUB_ROUND;
  };

  // 타임라인 데이터를 서브라운드(n-1, n-2) 단위로 그룹화
  const subRoundsData = useMemo(() => {
    return Array.from({ length: currentRound }, (_, i) => {
      const round = i + 1;
      return SUB_ROUNDS_PER_ROUND.map((subIndex) => {
        const pairIndex = (i * TEAMS_PER_SUB_ROUND + subIndex - 1) * TEAMS_PER_SUB_ROUND;

        return {
          round: `${round}-${subIndex}`,
          topic: topics[round - 1],
          attackA: attackList[pairIndex] || null,
          attackB: attackList[pairIndex + 1] || null,
          defenseA: defenseList[pairIndex] || null,
          defenseB: defenseList[pairIndex + 1] || null
        };
      });
    }).flat();
  }, [attackList, defenseList, currentRound, topics]);

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
          const [round, subIndex] = subRound.round.split('-').map(Number);
          const isExpanded = expandedRounds.has(subRound.round);
          const isActive = isSubRoundActive(round, subIndex);

          return (
            <div
              key={subRound.round}
              className={`bg-[#1a1a2e] rounded-lg border overflow-hidden ${
                isActive ? 'border-orange-500/50' : 'border-[#2d2d3f]'
              }`}
            >
              <RoundHeader
                round={subRound.round}
                topic={subRound.topic}
                isActive={isActive}
                isExpanded={isExpanded}
                onToggle={() => toggleRound(subRound.round)}
              />

              {isExpanded && (
                <div className="border-t border-[#2d2d3f]">
                  <PhaseCard
                    phase="attack-A"
                    challengeMessage={subRound.attackA}
                    rebuttalMessage={subRound.defenseB}
                    isWide={isWide}
                  />
                  <PhaseDivider />
                  <PhaseCard
                    phase="attack-B"
                    challengeMessage={subRound.attackB}
                    rebuttalMessage={subRound.defenseA}
                    isWide={isWide}
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
