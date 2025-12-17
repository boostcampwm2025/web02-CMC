import { Link } from 'react-router-dom';
import { type BattleCardItem } from '../types/battle';
import PeopleIcon from '@/assets/icon/people.svg?react';
import ClockIcon from '@/assets/icon/clock.svg?react';
import TrophyIcon from '@/assets/icon/trophy.svg?react';

import { TEAM_STYLE } from '../types/team';
import IconBox from './IconBox';

export default function PastBattleCard({ item }: { item: BattleCardItem }) {
  const teamStyle = TEAM_STYLE[item.winner ?? 'A'];

  return (
    <div className="w-full rounded-2xl bg-[#1A1A2E] overflow-hidden">
      {/* 상단 바 */}
      <div className="h-1 w-full" style={{ backgroundColor: teamStyle.color }} />

      <div className="p-6 flex flex-col gap-6">
        {/* 상태 영역 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <IconBox bgColor={teamStyle.background}>
              <TrophyIcon className="w-5 h-5" style={{ color: teamStyle.color }} />
            </IconBox>

            <div className="flex flex-col text-left">
              <span className="text-white text-sm">FINISHED</span>
              <span className="text-gray-400 text-xs uppercase">{item.category}</span>
            </div>
          </div>

          {/* 결과 배지 */}
          <span
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: teamStyle.background,
              color: teamStyle.color
            }}
          >
            {teamStyle.label}
          </span>
        </div>

        {/* 제목 / 설명 */}
        <div className="flex flex-col gap-2 text-left">
          <h3 className="text-white text-base font-normal">{item.title}</h3>
          <p className="text-sm text-gray-400">{item.description}</p>
        </div>

        {/* 투표 결과 (임시 UI) */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#2B7FFF]">코드 A</span>
              <span className="text-[#2B7FFF]">50%</span>
            </div>
            <div className="h-2 rounded-full bg-[#2D2D3F] overflow-hidden">
              <div className="h-full" style={{ width: '50%', backgroundColor: '#2B7FFF' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#FB2C36]">코드 B</span>
              <span className="text-[#FB2C36]">50%</span>
            </div>
            <div className="h-2 rounded-full bg-[#2D2D3F] overflow-hidden">
              <div className="h-full" style={{ width: '50%', backgroundColor: '#FB2C36' }} />
            </div>
          </div>
        </div>

        {/* 하단 */}
        <div className="mt-2 flex items-center justify-between">
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

          <Link
            to={`/battles/${item.id}/result`}
            className="rounded-xl bg-[#2D2D3F] px-4 py-2 text-sm text-white hover:bg-[#3A3A55] transition-colors"
          >
            결과 보기 →
          </Link>
        </div>
      </div>
    </div>
  );
}
