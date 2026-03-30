import { Link } from 'react-router-dom';
import { type BattleCardItem, BATTLE_CATEGORY_CONFIG } from '../../types/battle';
import Icon from '@/commons/components/Icon';
import IconBox from '../IconBox';
import Badge from '@/commons/components/Badge';

interface LiveBattleCardProps {
  battleInform: BattleCardItem;
  isHot?: boolean;
}

export default function LiveBattleCard({ battleInform, isHot = false }: LiveBattleCardProps) {
  const { category, title, description, timeLabel, clientCount, id, status } = battleInform;
  const config = BATTLE_CATEGORY_CONFIG[category] || BATTLE_CATEGORY_CONFIG.ETC;
  const { text, bg, bgSoft, icon: iconName } = config;
  return (
    <div className="w-full rounded-2xl bg-[#1A1A2E] overflow-hidden min-w-0">
      <div className={`h-1 w-full ${bg}`} />

      <div className="p-6 flex flex-col gap-6 min-w-0">
        <div className="flex items-start justify-between min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <IconBox className={bgSoft}>
              <Icon name={iconName} className={`w-6 h-6 ${text}`} />
            </IconBox>

            <div className="flex flex-col text-left min-w-0">
              <span className="text-white text-sm">TOURNAMENT</span>
              <span className="text-gray-400 text-xs uppercase">{category}</span>
            </div>
          </div>

          {(isHot || status === 'PENDING') && (
            <Badge textClass="text-yellow-400" bgClass="bg-yellow-400/20">
              {status === 'PENDING' ? '대기방' : 'Hot'}
            </Badge>
          )}
        </div>

        <div className="flex flex-col h-[6rem] gap-3 text-left min-w-0">
          <h3 className="text-white text-lg font-normal break-all line-clamp-1 overflow-hidden text-ellipsis">
            {title}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-4 break-all">{description}</p>
        </div>

        <div className="mt-auto flex items-center justify-between min-w-0">
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <div className="flex items-center gap-1">
              <Icon name="people" className="w-4 h-4" />
              <span>{clientCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="clock" className="w-4 h-4" />
              <span>{timeLabel}</span>
            </div>
          </div>

          <Link to={`/battle/${id}/team-select`} className="shrink-0 rounded-xl bg-orange-500 px-4 py-1.5 text-sm">
            LIVE NOW →
          </Link>
        </div>
      </div>
    </div>
  );
}
