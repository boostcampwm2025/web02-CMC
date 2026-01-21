import { StageIcon } from './StageIcon';
import DownArrowIcon from '@/assets/icon/downArrow.svg?react';
import type { BattlePhaseName } from '@cmc/types';

const COLOR_MAP = {
  BASE: { bg: '#0A0A1A', border: '#364153', text: '#99A1AF' },
  OPINION_SHARE: { bg: '#de932333', border: '#ffa200ff', text: '#ffa200ff' },
  ATTACK: { bg: '#f7414133', border: '#e33f12ff', text: '#de1f1fff' },
  DEFENSE: { bg: '#2b7fff33', border: '#2B7FFF', text: '#2B7FFF' },
  TEAM_SWITCH: { bg: '#bd5efc33', border: '#9500ffff', text: '#b300ffff' },
  PENDING: { bg: '#0A0A1A', border: '#364153', text: '#99A1AF' }
};

const STAGES = [
  {
    step: 1,
    phase: 'OPINION_SHARE',
    icon: 'message',
    label: '의견공유',
    description:
      '의견공유 시간입니다. 현재 라운드의 대주제를 확인하고 라운지에서 자유롭게 의견을 나누며 이의제기를 준비해주세요!'
  },
  {
    step: 2,
    phase: 'ATTACK',
    icon: 'battle',
    label: '공격(1차)',
    description:
      '1차 이의제기 시간입니다. 주어진 3분 동안 상대 코드의 문제점을 찾고 투표를 통해 공격할 내용을 선정해보세요!'
  },
  {
    step: 3,
    phase: 'DEFENSE',
    icon: 'shield',
    label: '수비(1차)',
    description:
      '1차 반론 시간입니다. 주어진 4분 동안 상대의 공격에 대한 반박 논리를 작성하고 투표를 통해 방어할 내용을 선정해보세요!'
  },
  {
    step: 4,
    phase: 'ATTACK',
    icon: 'battle',
    label: '공격(2차)',
    description:
      '2차 이의제기 시간입니다. 주어진 3분 동안 상대 코드 혹은 반론에 대한 문제점을 찾고 투표를 통해 공격할 내용을 선정해보세요!'
  },
  {
    step: 5,
    phase: 'DEFENSE',
    icon: 'shield',
    label: '수비(2차)',
    description:
      '2차 반론 시간입니다. 주어진 4분 동안 상대의 공격에 대한 반박 논리를 작성하고 투표를 통해 최종적으로 방어할 내용을 선정해보세요!'
  },
  {
    step: 6,
    phase: 'TEAM_SWITCH',
    icon: 'switch',
    label: '팀변경',
    description:
      '진영 선택 시간입니다. 라운드를 진행하며 나눈 공격과 수비를 다시 확인해보고 지지하시는 팀으로 변경하실 수 있습니다!'
  }
] as const;

interface StageListProps {
  round: number;
  phase: BattlePhaseName;
  phaseCount: number;
}

export function StageList({ round, phase, phaseCount }: StageListProps) {
  const getCurrentPhaseStep = () => {
    if (phase === 'OPINION_SHARE') return 1;
    if (phase === 'ATTACK') return phaseCount * 2;
    if (phase === 'DEFENSE') return phaseCount * 2 + 1;
    if (phase === 'TEAM_SWITCH') return 6;
    return 1;
  };

  const isActiveStage = (stageStep: number) => {
    return getCurrentPhaseStep() === stageStep;
  };

  const getStageColor = (stage: BattlePhaseName) => COLOR_MAP[stage] || COLOR_MAP.BASE;

  return (
    <div className="flex items-center gap-4 px-4">
      <div className="text-2xl font-bold text-[#FF6900] min-w-[6.25rem] flex items-center justify-center h-14">
        Round {round}
      </div>
      {STAGES.map((stage, index) => (
        <div key={stage.step} className="flex items-center gap-3">
          <StageIcon
            icon={stage.icon as 'message' | 'battle' | 'shield' | 'switch'}
            {...getStageColor(stage.phase as BattlePhaseName)}
            active={isActiveStage(stage.step)}
            small={true}
            tooltip={stage.description}
          />
          {index < STAGES.length - 1 && <DownArrowIcon className="-rotate-90 opacity-40" />}
        </div>
      ))}
    </div>
  );
}
