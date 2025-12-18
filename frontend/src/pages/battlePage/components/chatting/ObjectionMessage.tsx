import { getTimeAgo } from '@/utils/getTimeAgo';
import BattleIcon from '@/assets/icon/battle.svg?react';
import ShieldIcon from '@/assets/icon/shield.svg?react';

interface ObjectionMessageProps {
  team: 'A' | 'B' | 'NONE';
  content: string;
  timestamp: string;
  type: 'objection' | 'rebuttal';
}

export default function ObjectionMessage({ team, content, timestamp, type }: ObjectionMessageProps) {
  return (
    <div className={`flex justify-end mb-3 w-full shadow-lg `}>
      <div
        className={`flex flex-col items-end  rounded-lg px-3 min-w-[300px] max-w-[350px] ${type === 'objection' ? 'bg-red-700' : 'bg-blue-700'} `}
      >
        <div className="w-full flex justify-between items-center gap-2 mb-1 text-[15px] mt-1">
          <div className="flex gap-2">
            {type === 'objection' ? (
              <BattleIcon className="w-[24px] h-[24px]" />
            ) : (
              <ShieldIcon className="w-[26px] h-[26px]" />
            )}
            <span className="font-semibold">
              {team}팀 {type === 'objection' ? '이의제기' : '반박'}
            </span>
          </div>
          <span className="text-[11px] text-slate-100">{getTimeAgo(timestamp)}</span>
        </div>
        <p className="text-[20px] font-bold text-slate-200 mb-3 ml-12 text-start w-full">{content}</p>
      </div>
    </div>
  );
}
