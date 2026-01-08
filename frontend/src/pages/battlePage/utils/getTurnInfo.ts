import type { BattlePhase } from '@/commons/types/battle';

interface PhaseInfo {
  title: string;
  description: string;
}

export const getPhaseInfo = (phase: string | null): PhaseInfo => {
  if (!phase) {
    return {
      title: '대기 중',
      description: '배틀이 시작되기를 기다리고 있습니다.'
    };
  }

  const PHASE_MAP: Record<BattlePhase, PhaseInfo> = {
    PENDING: {
      title: '대기 중',
      description: '배틀이 곧 시작됩니다.'
    },
    OPINION_SHARE: {
      title: '의견 공유',
      description: '코드를 분석하고 팀원들과 의견을 나누세요.'
    },
    ATTACK: {
      title: '이의제기',
      description: '상대 코드의 문제점을 지적하세요.'
    },
    DEFENSE: {
      title: '반론',
      description: '이의제기에 대해 반론을 제시하세요.'
    },
    TEAM_SWITCH: {
      title: '팀 변경',
      description: '팀을 변경할 수 있는 시간입니다.'
    }
  };

  if (phase in PHASE_MAP) {
    return PHASE_MAP[phase as BattlePhase];
  }

  return {
    title: phase,
    description: '현재 진행 중인 단계입니다.'
  };
};
