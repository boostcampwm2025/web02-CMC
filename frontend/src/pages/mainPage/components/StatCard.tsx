import TimeLineIcon from '@/assets/icon/timeline.svg?react';
import PlusIcon from '@/assets/icon/plus.svg?react';
import BattleIcon from '@/assets/icon/battle.svg?react';

interface Props {
  label: string;
  value: string;
  hint?: string;
}

export default function StatCard({ label, value }: Props) {
  const icons = [TimeLineIcon, PlusIcon, BattleIcon];

  const labelIndex: { [key: string]: number } = {
    '진행된 배틀': 0,
    '실시간 배틀': 1,
    '참여 개발자': 2
  };

  const IconComponent = icons[labelIndex[label] ?? 0];

  return (
    <div className=" w-full rounded-2xl bg-[#1A1A2E] overflow-hidden">
      {/* 상단 바 */}
      <div className="h-1 w-full bg-orange-500 neon-bar" />

      {/* 콘텐츠 */}
      <div className="flex items-center gap-4 p-6">
        {/* 아이콘 */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'rgba(255, 105, 0, 0.10)' }}
        >
          <IconComponent />
        </div>

        {/* 텍스트 */}
        <div className="flex flex-col text-left">
          <p className="text-xl font-semibold">{value}</p>
          <p className="mt-1 text-sm text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}
