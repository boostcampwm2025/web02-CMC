import ParticipantRatioBar from './ParticipantRatioBar';
import StageIndicator from './StageIndicator';
import BattleTimer from './BattleTimer';
import TeamCounter from './TeamCounter';
import TimeProgressBar from './TimeProgressBar';
import { useBattleStore, selectBattleProgress } from '@/pages/battlePage/stores/battleStore';
import type { Phase } from '@/commons/types/battle';

const PHASE_INSTRUCTIONS: Record<Phase, string> = {
  PENDING: '',
  OPINION_SHARE: '자유롭게 의견을 작성하고 투표에 참여해주세요',
  ATTACK: '주어진 시간 내에 상대 코드의 문제점을 지적해주세요',
  DEFENSE: '상대의 공격에 대한 반박 논리를 작성해주세요',
  TEAM_SWITCH: '원하시는 팀으로 변경하실 수 있습니다'
};

export default function BattleHeader() {
  const battleProgress = useBattleStore(selectBattleProgress);
  const phase = (battleProgress?.phase as Phase) || 'PENDING';
  const instruction = PHASE_INSTRUCTIONS[phase] || PHASE_INSTRUCTIONS.PENDING;

  return (
    <header className="h-[185px] w-[1800px] bg-[#1E1E2F] rounded-lg mb-2 overflow-hidden flex flex-col">
      <TimeProgressBar />
      <div className="px-8 flex-1 flex items-center justify-between">
        <StageIndicator />
        {phase !== 'PENDING' && (
          <div className="flex flex-col items-center justify-center">
            <BattleTimer />
            <p className="text-sm text-gray-400">{instruction}</p>
          </div>
        )}
        <TeamCounter />
      </div>
      <ParticipantRatioBar />
    </header>
  );
}
