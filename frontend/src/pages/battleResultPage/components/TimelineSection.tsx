import RoundCard from '@/commons/components/timeline/RoundCard';
import { getTimeAgo } from '@/commons/utils/getTimeAgo';
import { organizeTimelineByRounds } from '../utils/organizeTimelineByRounds';
import type { TimelineItem } from '../types';

interface TimelineSectionProps {
  timelines: TimelineItem[];
  topics: string[];
}

export default function TimelineSection({ timelines, topics }: TimelineSectionProps) {
  const roundsData = organizeTimelineByRounds({ timelines, topics });

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '알 수 없음';
    return getTimeAgo(new Date(timestamp).toISOString());
  };

  return (
    <div className="max-w-7xl mx-auto mb-12">
      <div className="w-full bg-[#0d0d1a]/50 rounded-2xl p-8 border border-[#1a1a2e]">
        <div className="flex gap-2 items-center mb-6">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          <h2 className="text-2xl font-bold">배틀 타임라인</h2>
        </div>
        <div className="space-y-4">
          {roundsData.map((roundData) => (
            <RoundCard
              key={roundData.round}
              roundData={roundData}
              isExpanded={true}
              onToggle={() => {}}
              formatTime={formatTime}
              showStatus={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
