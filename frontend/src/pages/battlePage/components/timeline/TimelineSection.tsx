import { useState } from 'react';
import BattleIcon from '@/assets/icon/battle.svg?react';
import DownArrowIcon from '@/assets/icon/downArrow.svg?react';
import TimelineCard from './TimelineCard';

interface TimelineItem {
  id: number;
  user: string;
  team: 'A' | 'B';
  type: '이의제기' | '반박';
  content: string;
  timestamp: string;
  voteCount: number;
}

const MOCK_TIMELINE: TimelineItem[] = [
  {
    id: 1,
    user: 'Alice',
    team: 'A',
    type: '이의제기',
    content: '구현 A의 Set 사용이 더 효율적입니다. O(1) 시간 복잡도로 중복을 제거합니다.',
    timestamp: '2024-12-16 21:30:00',
    voteCount: 15
  },
  {
    id: 2,
    user: 'Bob',
    team: 'B',
    type: '반박',
    content: '구현 B의 반복문 사용이 더 명확하고 이해하기 쉽습니다.',
    timestamp: '2024-12-16 21:30:00',
    voteCount: 15
  },
  {
    id: 3,
    user: 'Alice',
    team: 'A',
    type: '이의제기',
    content: '구현 A의 Set 사용이 더 효율적입니다. O(1) 시간 복잡도로 중복을 제거합니다.',
    timestamp: '2024-12-16 21:30:00',
    voteCount: 15
  }
];

export default function TimelineSection() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [timeline, setTimeline] = useState<TimelineItem[]>(MOCK_TIMELINE);

  /*
  useEffect(() => {
    // @Todos : 소켓으로 타임 라인 데이터 구독 로직 추가 필요
  }, []);
  */

  return (
    <section className="w-[1193px] mt-2">
      <div className="bg-[#1E1E2F] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-2">
          <BattleIcon className="text-[#AD46FF]" />
          <h2 className="text-[18px] font-bold text-white">이의제기 & 반박 타임라인</h2>
        </div>
        <h3 className="text-[14px] text-[#99A1AF] text-left mb-6">
          각 진영의 주장과 반박을 시간순으로 확인하고 투표하세요
        </h3>
        <div className="space-y-4">
          {timeline.map((item) => (
            <div key={item.id} className="relative">
              {item.type === '반박' && (
                <div className="flex gap-2 items-center my-4 ml-17">
                  <DownArrowIcon className="w-[32px] h-[32px] bg-[#59168B] fill-[#C27AFF] rounded-full px-1 py-1" />
                  <p className="text-[14px] text-[#C27AFF]">반박</p>
                </div>
              )}
              <TimelineCard
                user={item.user}
                team={item.team}
                type={item.type}
                content={item.content}
                timestamp={item.timestamp}
                voteCount={item.voteCount}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
