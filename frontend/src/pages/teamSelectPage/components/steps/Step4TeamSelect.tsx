import { Flag } from 'lucide-react';
import TeamCard from '../TeamCard';
import type { Team } from '@/commons/types/battle';

interface Step4TeamSelectProps {
  onSelect: (team: Team) => void;
  selectedTeam?: Team;
}

export default function Step4TeamSelect({ onSelect, selectedTeam }: Step4TeamSelectProps) {
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-6xl mx-auto">
      {/* 상단 섹션 */}
      <div className="text-center mb-8">
        <Flag className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">진영 선택</h2>
        <p className="text-gray-400">A팀, B팀 또는 중립 진영을 선택하세요</p>
      </div>

      {/* 중앙 컨테이너 */}
      <div className="w-full bg-[#0d0d1a]/50 rounded-2xl p-8 border border-[#1a1a2e]">
        <div className="flex items-center justify-center gap-6 flex-wrap">
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
