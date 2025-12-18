import { Link } from 'react-router-dom';
import type { ClosedBattleItem } from '../types/battle';
import ClockIcon from '@/assets/icon/clock.svg?react';
import TrophyIcon from '@/assets/icon/trophy.svg?react';

import { TEAM_STYLE } from '../types/team';
import IconBox from './IconBox';

export default function PastBattleCard({ item }: { item: ClosedBattleItem }) {
  const { winner, teamA, teamB } = item.result;

  const teamStyle = winner === 'DRAW' ? TEAM_STYLE.DRAW : TEAM_STYLE[winner];

  return (
    <div className="w-full rounded-2xl bg-[#1A1A2E] overflow-hidden">
      {/* 상단 바 */}
      <div className="h-1 w-full" style={{ backgroundColor: teamStyle.color }} />

      <div className="p-6 flex flex-col gap-6">
        {/* 상태 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <IconBox bgColor={teamStyle.background}>
              <TrophyIcon className="w-5 h-5" style={{ color: teamStyle.color }} />
            </IconBox>

            <div className="flex flex-col text-left">
              <span className="text-white text-sm">FINISHED</span>
              <span className="text-gray-400 text-sm uppercase">{item.category}</span>
            </div>
          </div>

          <span
            className="px-3 py-1 rounded-full text-xs"
            style={{
              backgroundColor: teamStyle.background,
              color: teamStyle.color
            }}
          >
            {teamStyle.label}
          </span>
        </div>

        {/* 제목 */}
        <div className="flex flex-col gap-2 text-left">
          <h3 className="text-white text-base font-normal">{item.title}</h3>
          <p className="text-sm text-gray-400">{item.description}</p>
        </div>

        {/* 투표 결과 */}
        <div className="flex flex-col gap-4">
          {/* A */}
          <VoteBar label="코드 A" color="#2B7FFF" pct={teamA.percentage} />
          {/* B */}
          <VoteBar label="코드 B" color="#FB2C36" pct={teamB.percentage} />
        </div>

        {/* 하단 */}
        <div className="mt-2 flex items-center justify-between text-gray-400 text-sm">
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            <span>종료됨</span>
          </div>

          <Link
            to={`/battles/${item?.id}/result`}
            className="rounded-xl bg-[#2D2D3F] px-4 py-2 text-sm hover:bg-[#3A3A55]"
          >
            결과 보기 →
          </Link>
        </div>
      </div>
    </div>
  );
}

function VoteBar({ label, color, pct }: { label: string; color: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span style={{ color }}>{label}</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#2D2D3F] overflow-hidden">
        <div className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
