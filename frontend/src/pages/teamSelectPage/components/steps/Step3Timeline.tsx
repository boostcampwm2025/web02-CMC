import TimelineItem from '../TimelineItem';
import type { TimelineItem as TimelineItemType } from '../../types/teamSelect';

interface Step3TimelineProps {
  timelines: TimelineItemType[];
}

export default function Step3Timeline({ timelines }: Step3TimelineProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">배틀 진행 과정</h3>
        <p className="text-[#99A1AF]">양측의 이의제기와 반박을 확인해보세요</p>
      </div>

      {timelines.length === 0 ? (
        <div className="bg-[#1E1E2F] border-2 border-[#2D2D3F] rounded-lg p-12 w-full text-center">
          <p className="text-[#99A1AF]">아직 이의제기나 반박이 없습니다</p>
        </div>
      ) : (
        <div className="w-full bg-[#1E1E2F] border-2 border-[#2D2D3F] rounded-lg p-6 max-h-[500px] overflow-auto scrollbar-thin">
          <div className="flex flex-col gap-4">
            {timelines.map((timeline) => (
              <TimelineItem key={timeline.id} {...timeline} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
