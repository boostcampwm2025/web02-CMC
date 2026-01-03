import { useMemo } from 'react';
import BattleIcon from '@/assets/icon/battle.svg?react';
import DownArrowIcon from '@/assets/icon/downArrow.svg?react';
import TimelineCard from './TimelineCard';
import type { BattleDiscussion } from '@/commons/types/battle';
import { useBattleStore, selectTimelines } from '../../stores/battleStore';

export default function TimelineSection() {
  const timelines = useBattleStore(selectTimelines);

  const attackList = timelines?.attacks || [];
  const defenseList = timelines?.defenses || [];

  const timeLines = useMemo(() => {
    const maxLength = attackList.length;
    const result: BattleDiscussion[] = [];

    for (let i = 0; i < maxLength; i++) {
      if (i < attackList.length) {
        result.push(attackList[i]);
      }
      if (i < defenseList.length) {
        result.push(defenseList[i]);
      }
    }

    return result;
  }, [attackList, defenseList]);

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
          {timeLines.map((item) => (
            <div key={item.discussionId} className="relative">
              {item.type === 'DEFENSE' && (
                <div className="flex gap-2 items-center my-4 ml-17">
                  <DownArrowIcon className="w-[32px] h-[32px] bg-[#59168B] fill-[#C27AFF] rounded-full px-1 py-1" />
                  <p className="text-[14px] text-[#C27AFF]">반박</p>
                </div>
              )}
              <TimelineCard discussionDetails={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
