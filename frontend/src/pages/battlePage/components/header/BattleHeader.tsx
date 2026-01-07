import ProgressBar from './ProgressBar';
import StageIndicator from './StageIndicator';
import BattleTimer from './BattleTimer';
import TeamCounter from './TeamCounter';

interface BattleHeaderProps {
  title: string;
  description: string;
}

export default function BattleHeader({ title, description }: BattleHeaderProps) {
  console.log(title);
  console.log(description);

  return (
    <header className="h-[185px] w-[1800px] bg-[#1E1E2F] rounded-lg mb-2 overflow-hidden flex flex-col">
      <div className="bg-blue-500 h-[6px]" />

      <div className="px-8 flex-1 flex items-center justify-between">
        <StageIndicator />

        <div className="flex flex-col items-center justify-center">
          <BattleTimer />
          <p className="text-sm text-gray-400">주어진 시간 내에 코드의 문제점을 지적하세요</p>
        </div>

        <TeamCounter />
      </div>

      <ProgressBar />
    </header>
  );
}
