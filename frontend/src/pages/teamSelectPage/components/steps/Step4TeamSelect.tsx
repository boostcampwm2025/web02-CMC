import { Flag } from 'lucide-react';
import TeamCard from '../TeamCard';
import type { BattleTeam } from '@cmc/types';

interface Step4TeamSelectProps {
  onSelect: (team: BattleTeam) => void;
  selectedTeam?: BattleTeam;
}

export default function Step4TeamSelect({ onSelect, selectedTeam }: Step4TeamSelectProps) {
  return (
    <div className="flex flex-col items-center gap-4 xl:gap-6 2xl:gap-8 w-full max-w-6xl mx-auto px-4">
      {/* 상단 섹션 */}
      <div className="text-center mb-4 xl:mb-6 2xl:mb-8">
        <Flag className="w-10 h-10 xl:w-12 xl:h-12 2xl:w-16 2xl:h-16 text-orange-500 mx-auto mb-2 xl:mb-3 2xl:mb-4" />
        <h2 className="text-xl xl:text-2xl 2xl:text-3xl font-bold text-white mb-1 xl:mb-2">진영 선택</h2>
        <p className="text-sm xl:text-base text-gray-400">A팀, B팀 또는 중립 진영을 선택하세요</p>
      </div>

      {/* 중앙 컨테이너 */}
      <div className="w-full bg-[#0d0d1a]/50 rounded-lg xl:rounded-xl 2xl:rounded-2xl p-4 xl:p-6 2xl:p-8 border border-[#1a1a2e]">
        <div className="flex items-center justify-center gap-3 xl:gap-4 2xl:gap-6 flex-wrap">
          <TeamCard
            team="A"
            label="A팀"
            description="구현 A가 더 우수하다고 생각한다면 이 진영을 선택하세요."
            isSelected={selectedTeam === 'A'}
            onClick={() => onSelect('A')}
          />

          <TeamCard
            team="NONE"
            label="중립"
            description="아직 결정하지 못했다면 중립으로 시작하세요"
            isSelected={selectedTeam === 'NONE'}
            onClick={() => onSelect('NONE')}
          />

          <TeamCard
            team="B"
            label="B팀"
            description="구현 B가 더 우수하다고 생각한다면 이 진영을 선택하세요."
            isSelected={selectedTeam === 'B'}
            onClick={() => onSelect('B')}
          />
        </div>
      </div>
    </div>
  );
}
