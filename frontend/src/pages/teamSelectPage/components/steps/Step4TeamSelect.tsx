import TeamCard from '../TeamCard';
import type { Team } from '../../types/teamSelect';

interface Step4TeamSelectProps {
  onSelect: (team: Team) => void;
  selectedTeam?: Team;
}

export default function Step4TeamSelect({ onSelect, selectedTeam }: Step4TeamSelectProps) {
  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">진영을 선택하세요</h3>
        <p className="text-[#99A1AF]">한 번 선택하면 변경할 수 없습니다</p>
      </div>

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
  );
}
