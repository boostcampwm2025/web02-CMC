import Icon from '@/commons/components/Icon';
import type { BattleInfo } from '@/commons/types/battle';
import BattleDetailCard from './BattleDetailCard';
import ParticipantCard from './ParticipantCard';
import RoundProgressCard from './RoundProgressCard';

interface BattleInfoProps {
  battleInfo: BattleInfo;
}

export default function BattleInfo({ battleInfo }: BattleInfoProps) {
  const {
    title,
    description,
    category,
    language,
    currentRound,
    totalRounds,
    topics,
    participantCount,
    currentPhase,
    phaseCount
  } = battleInfo;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-6xl mx-auto px-4">
      <div className="text-center mb-4">
        <Icon name="trendingUp" className="battle-info-icon-size text-orange-500 mx-auto mb-2" />
        <h2 className="battle-info-title-size font-bold text-white mb-1">상황 요약</h2>
        <p className="battle-info-desc-size text-gray-400">현재 배틀 진행 현황을 확인하세요</p>
      </div>

      <div className="w-full bg-[#0d0d1a]/50 rounded-lg border border-[#1a1a2e] battle-info-card-padding">
        <BattleDetailCard title={title} description={description} category={category} language={language} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <ParticipantCard participantCount={participantCount} />
          <RoundProgressCard
            currentRound={currentRound}
            totalRounds={totalRounds}
            topics={topics}
            currentPhase={currentPhase ?? null}
            phaseCount={phaseCount ?? null}
          />
        </div>
      </div>
    </div>
  );
}
