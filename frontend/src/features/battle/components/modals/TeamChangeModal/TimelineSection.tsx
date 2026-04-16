import PhaseFlowCard from './PhaseFlowCard';
import { getTimelineData } from './utils/getTimelineData';
import type { TimelineSectionProps } from './types';

export default function TimelineSection({ topic, currentRound, timelines }: TimelineSectionProps) {
  const timelineData = getTimelineData(currentRound, timelines);

  return (
    <div>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold">Round {currentRound} </h3>

          <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-500 text-white">{topic}</span>
        </div>
        <p className="text-sm text-gray-400 mb-4">타임라인을 확인하고 진영을 변경하세요</p>
      </div>
      <PhaseFlowCard
        attackTeam="A"
        defenseTeam="B"
        attackMessage={timelineData.turn1.attackA}
        defenseMessage={timelineData.turn1.defenseB}
      />

      <PhaseFlowCard
        attackTeam="B"
        defenseTeam="A"
        attackMessage={timelineData.turn1.attackB}
        defenseMessage={timelineData.turn1.defenseA}
      />

      <PhaseFlowCard
        attackTeam="A"
        defenseTeam="B"
        attackMessage={timelineData.turn2.attackA}
        defenseMessage={timelineData.turn2.defenseB}
      />

      <PhaseFlowCard
        attackTeam="B"
        defenseTeam="A"
        attackMessage={timelineData.turn2.attackB}
        defenseMessage={timelineData.turn2.defenseA}
      />
    </div>
  );
}
