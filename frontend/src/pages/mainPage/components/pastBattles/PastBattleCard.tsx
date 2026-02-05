import { Link } from 'react-router-dom';
import type { ClosedBattleItem } from '../../types/battle';
import { TEAM_STYLE } from '../../types/team';
import IconBox from '../IconBox';
import ClockIcon from '@/assets/icon/clock.svg?react';
import TrophyIcon from '@/assets/icon/trophy.svg?react';
import Badge from '@/commons/components/Badge';

export default function PastBattleCard({ item }: { item: ClosedBattleItem }) {
  const { winner, teamA, teamB } = item.result;
  const teamStyle = winner === 'DRAW' ? TEAM_STYLE.DRAW : TEAM_STYLE[winner];

  return (
    <div className="w-full h-[24.5rem] rounded-2xl bg-[#1A1A2E] overflow-hidden">
      <div className={`h-1 w-full ${teamStyle.bg}`} />

      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <IconBox className={teamStyle.bgSoft}>
              <TrophyIcon className={`w-5 h-5 ${teamStyle.text}`} />
            </IconBox>

            <div className="flex flex-col text-left">
              <span className="text-white text-sm">FINISHED</span>
              <span className="text-gray-400 text-sm uppercase">{item.category}</span>
            </div>
          </div>

          <Badge textClass={teamStyle.text} bgClass={teamStyle.bgSoft}>
            {teamStyle.label}
          </Badge>
        </div>

        <div className="flex flex-col gap-2 text-left min-w-0 h-[6rem]">
          <h3 className="text-white text-base font-normal break-all line-clamp-1 overflow-hidden text-ellipsis">
            {item.title}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-3 break-all">{item.description}</p>
        </div>

        <div className="flex flex-col gap-4">
          <VoteBar label="코드 A" pct={teamA.percentage} barClass="bg-blue-400" textClass="text-blue-400" />
          <VoteBar label="코드 B" pct={teamB.percentage} barClass="bg-red-400" textClass="text-red-400" />
        </div>

        <div className="mt-1 flex items-center justify-between text-gray-400 text-sm">
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            <span>종료됨</span>
          </div>

          <Link
            to={`/battles/${item.id}/result`}
            className="rounded-xl bg-[#2D2D3F] px-4 py-2 text-sm hover:bg-[#3A3A55]"
          >
            결과 보기 →
          </Link>
        </div>
      </div>
    </div>
  );
}

function VoteBar({
  label,
  pct,
  barClass,
  textClass
}: {
  label: string;
  pct: number;
  barClass: string;
  textClass: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className={textClass}>{label}</span>
        <span className={textClass}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#2D2D3F] overflow-hidden">
        <div className={`h-full ${barClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
