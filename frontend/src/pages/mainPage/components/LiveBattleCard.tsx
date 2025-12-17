import { Link } from 'react-router-dom';
import { type BattleCardItem, CATEGORY_COLORS } from '../types';

import CrownIcon from '@/assets/icon/crown.svg?react';
import TrophyIcon from '@/assets/icon/trophy.svg?react';
import PeopleIcon from '@/assets/icon/people.svg?react';
import ClockIcon from '@/assets/icon/clock.svg?react';

const CATEGORY_LABELS: Record<string, string> = {
  algorithm: 'algorithm',
  refactoring: 'refactoring',
  implementation: 'implementation',
  etc: 'etc'
};

export default function LiveBattleCard({ item }: { item: BattleCardItem }) {
  const categoryConfig = CATEGORY_COLORS[item.category];
  const IconComponent = categoryConfig.icon === 'trophy' ? TrophyIcon : CrownIcon;

  return (
    <Link to="/team-select" className="block h-full">
      <div
        className="
        cursor-pointer
        hover:opacity-90
        transition-opacity"
      >
        {/* 상단 카테고리 색상 바 */}
        <div className="w-full h-1 neon-bar" style={{ backgroundColor: categoryConfig.primary }}></div>

        {/* 내용 영역 */}
        <div className="p-6">
          {/* 상단 섹션 */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: categoryConfig.background }}
              >
                <IconComponent />
              </div>

              {/* 텍스트 */}
              <div className="flex flex-col gap-1 text-left">
                <span className="text-white text-[14px] leading-5">TOURNAMENT</span>
                <span className="text-[#99A1AF] text-[12px] leading-4 uppercase">
                  {CATEGORY_LABELS[item.category] || item.category}
                </span>
              </div>
            </div>
          </div>

          {/* 문제 설명 섹션 */}
          <div className="flex flex-col text-left">
            <h3 className="text-white text-base font-normal mb-4">{item.title}</h3>
            <p className="text-sm  text-gray-400">{item.description}</p>
          </div>

          {/* 하단 섹션 + Live now 버튼 */}
          <div className="pt-4 border-t border-[#1E2939]">
            {/* 왼쪽쪽 */}
            <div className="flex items-center justify-between">
              {/* 참여자 수 + 시간 */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <PeopleIcon width={16} height={16} />
                  <span className="text-sm text-gray-400">{item.clientCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon width={16} height={16} />
                  <span className="text-sm text-gray-400">{item.timeLabel}</span>
                </div>
              </div>

              <button
                className="bg-orange-500 rounded-xl px-4 py-1.5 text-white text-base font-normal  hover:bg-orange-600 transition-colors"
                type="button"
              >
                LIVE NOW →
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
