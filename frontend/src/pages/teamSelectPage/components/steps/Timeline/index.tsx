import Icon from '@/commons/components/Icon';
import type { BattleDiscussion, BattleDefense, BattleInfo } from '@/commons/types/battle';
import { organizeByRounds } from '@/pages/teamSelectPage/utils/organizeByRounds';
import RoundItem from './RoundItem';

interface TimelineProps {
  battleInfo: BattleInfo;
}

export default function Timeline({ battleInfo }: TimelineProps) {
  const { topics, currentRound, totalRounds } = battleInfo;
  const timelines: Array<BattleDiscussion | BattleDefense> = [
    ...battleInfo.timelines.attacks,
    ...battleInfo.timelines.defenses
  ];

  const roundsData = organizeByRounds({ timelines, topics, currentRound, totalRounds });

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <Icon name="clock" className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">타임라인</h2>
        <p className="text-gray-400">양측의 이의제기와 반박을 확인해보세요</p>
      </div>

      <div className="w-full bg-[#0d0d1a]/50 rounded-2xl p-8 border border-[#1a1a2e]">
        {timelines.length === 0 ? (
          <div className="bg-[#1e1e2f] rounded-xl border border-[#2d2d3f] p-8">
            <div className="text-center text-gray-400">
              <Icon name="flame" className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-lg font-medium mb-1">아직 이의제기가 없습니다</p>
              <p className="text-sm">배틀이 시작되면 여기에 표시됩니다</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {roundsData.map((roundData) => (
              <RoundItem key={roundData.round} roundData={roundData} defaultExpanded={roundData.isActive} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
