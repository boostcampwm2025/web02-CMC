import { Clock } from 'lucide-react';
import TimelineItem from '../TimelineItem';
import type { TimelineItem as TimelineItemType } from '../../types/teamSelect';

interface Step3TimelineProps {
  timelines: TimelineItemType[];
}

export default function Step3Timeline({ timelines }: Step3TimelineProps) {
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-6xl mx-auto">
      {/* 상단 섹션 */}
      <div className="text-center mb-8">
        <Clock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">타임라인</h2>
        <p className="text-gray-400">양측의 이의제기와 반박을 확인해보세요</p>
      </div>

      {/* 중앙 컨테이너 */}
      <div className="w-full bg-[#0d0d1a]/50 rounded-2xl p-8 border border-[#1a1a2e]">
        {timelines.length === 0 ? (
          <div className="bg-[#16162a] border border-[#2d2d3f] rounded-xl p-12 w-full text-center">
            <p className="text-[#99A1AF]">아직 이의제기나 반박이 없습니다</p>
          </div>
        ) : (
          <div className="w-full bg-[#16162a] border border-[#2d2d3f] rounded-xl p-6 max-h-[500px] overflow-auto scrollbar-thin">
            <div className="flex flex-col gap-4">
              {timelines.map((timeline) => (
                <TimelineItem key={timeline.id} {...timeline} allTimelines={timelines} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
