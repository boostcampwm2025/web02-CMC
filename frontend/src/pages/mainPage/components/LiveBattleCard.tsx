import { Link } from 'react-router-dom';
import { type BattleCardItem, BATTLE_CATEGORY_CONFIG } from '../types/battle';
import PeopleIcon from '@/assets/icon/people.svg?react';
import ClockIcon from '@/assets/icon/clock.svg?react';
import IconBox from './IconBox';
import Badge from '@/components/Badge';

interface LiveBattleCardProps {
  item: BattleCardItem;
  isHot?: boolean;
}

export default function LiveBattleCard({ item, isHot = false }: LiveBattleCardProps) {
  const { text, bg, bgSoft, icon: Icon } = BATTLE_CATEGORY_CONFIG[item.category];

  return (
    <div className="w-full rounded-2xl bg-[#1A1A2E] overflow-hidden">
      {/* 상단 바 */}
      <div className={`h-1 w-full ${bg}`} />

      {/* 본문 */}
      <div className="p-6 flex flex-col gap-6">
        {/* 상단 정보 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <IconBox className={bgSoft}>
              <Icon className={`w-6 h-6 ${text}`} />
            </IconBox>

            <div className="flex flex-col text-left">
              <span className="text-white text-sm">TOURNAMENT</span>
              <span className="text-gray-400 text-xs uppercase">{item.category}</span>
            </div>
          </div>
          {isHot && (
            <Badge textClass={'text-yellow-400'} bgClass={'bg-yellow-400/20'}>
              Hot
            </Badge>
          )}
        </div>

        {/* 제목 / 설명 */}
        <div className="flex flex-col gap-3 text-left">
          <h3 className="text-white text-base font-normal">{item.title}</h3>
          <p className="text-sm text-gray-400">{item.description}</p>
        </div>

        {/* 하단 영역 */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <div className="flex items-center gap-1">
              <PeopleIcon className="w-4 h-4" />
              <span>{item.clientCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              <span>{item.timeLabel}</span>
            </div>
          </div>

          <Link to="/team-select" className="rounded-xl bg-orange-500 px-4 py-1.5 text-sm">
            LIVE NOW →
          </Link>
        </div>
      </div>
    </div>
  );
}
