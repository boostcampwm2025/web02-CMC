import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import BattleIcon from '@/assets/icon/battle.svg?react';
import DownArrowIcon from '@/assets/icon/downArrow.svg?react';
import TimelineCard from './TimelineCard';
import type { BattleDiscussion } from '@/commons/types/battle';
import { useBattleStore, selectTimelines } from '../../stores/battleStore';

interface RoundGroup {
  round: number;
  items: BattleDiscussion[];
}

export default function TimelineSection() {
  const timelines = useBattleStore(selectTimelines);
  const [expandedRounds, setExpandedRounds] = useState<Set<number>>(new Set([1]));

  const attackList = timelines?.attacks || [];
  const defenseList = timelines?.defenses || [];

  // 라운드별로 그룹화: A팀 이의제기 -> B팀 이의제기 -> A팀 반론 -> B팀 반론
  const roundGroups = useMemo(() => {
    const groups: RoundGroup[] = [];
    const maxPairs = Math.max(attackList.length, defenseList.length) / 2; // A, B 한 쌍씩

    for (let i = 0; i < maxPairs; i++) {
      const roundNumber = i + 1;
      const roundItems: BattleDiscussion[] = [];

      // 이의제기: A팀 먼저, B팀 나중 (인덱스 i*2, i*2+1)
      const aAttackIdx = i * 2;
      const bAttackIdx = i * 2 + 1;

      if (aAttackIdx < attackList.length) {
        roundItems.push(attackList[aAttackIdx]);
      }
      if (bAttackIdx < attackList.length) {
        roundItems.push(attackList[bAttackIdx]);
      }

      // 반론: A팀 먼저, B팀 나중
      const aDefenseIdx = i * 2;
      const bDefenseIdx = i * 2 + 1;

      if (aDefenseIdx < defenseList.length) {
        roundItems.push(defenseList[aDefenseIdx]);
      }
      if (bDefenseIdx < defenseList.length) {
        roundItems.push(defenseList[bDefenseIdx]);
      }

      if (roundItems.length > 0) {
        groups.push({ round: roundNumber, items: roundItems });
      }
    }

    return groups;
  }, [attackList, defenseList]);

  const toggleRound = (round: number) => {
    setExpandedRounds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(round)) {
        newSet.delete(round);
      } else {
        newSet.add(round);
      }
      return newSet;
    });
  };

  return (
    <section className="w-[1193px] mt-2">
      <div className="bg-[#1E1E2F] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-2">
          <BattleIcon className="text-[#AD46FF]" />
          <h2 className="text-[18px] font-bold text-white">이의제기 & 반박 타임라인</h2>
        </div>
        <h3 className="text-[14px] text-[#99A1AF] text-left mb-6">
          각 진영의 주장과 반박을 라운드별로 확인하고 투표하세요
        </h3>
        <div className="space-y-4">
          {roundGroups.map((group) => {
            const isExpanded = expandedRounds.has(group.round);
            return (
              <div key={group.round} className="border border-[#2D2D3F] rounded-lg overflow-hidden">
                {/* 라운드 헤더 (토글 버튼) */}
                <button
                  onClick={() => toggleRound(group.round)}
                  className="w-full flex items-center justify-between p-4 bg-[#2D2D3F] hover:bg-[#3D3D4F] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-[#AD46FF]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#AD46FF]" />
                    )}
                    <span className="text-white font-bold text-lg">라운드 {group.round}</span>
                    <span className="text-gray-400 text-sm">
                      ({group.items.filter((i) => i.type === 'ATTACK').length}개 이의제기,{' '}
                      {group.items.filter((i) => i.type === 'DEFENSE').length}개 반론)
                    </span>
                  </div>
                </button>

                {/* 라운드 내용 */}
                {isExpanded && (
                  <div className="p-4 space-y-4 bg-[#1A1A2A]">
                    {group.items.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">투표로 선정된 의견이 없습니다</div>
                    ) : (
                      group.items.map((item, idx) => {
                        const prevItem = group.items[idx - 1];
                        const showDefenseLabel = item.type === 'DEFENSE' && prevItem?.type === 'ATTACK';

                        return (
                          <div key={item.discussionId} className="relative">
                            {showDefenseLabel && (
                              <div className="flex gap-2 items-center my-4 ml-17">
                                <DownArrowIcon className="w-[32px] h-[32px] bg-[#59168B] fill-[#C27AFF] rounded-full px-1 py-1" />
                                <p className="text-[14px] text-[#C27AFF]">반박</p>
                              </div>
                            )}
                            <TimelineCard discussionDetails={item} />
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
