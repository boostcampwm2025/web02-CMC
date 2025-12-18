import type { BattlePhase, TurnStatus } from '@/commons/types/battle';

interface TurnInfo {
  title: string;
  description: string;
}

export const getTurnInfo = (stage: string | null): TurnInfo => {
  if (!stage) {
    return {
      title: '대기 중',
      description: '배틀이 시작되기를 기다리고 있습니다.'
    };
  }

  const phaseMap: Record<BattlePhase, TurnInfo> = {
    OPINION_SHARE: {
      title: '의견 공유 시간',
      description: '코드를 분석하고 팀원들과 의견을 나누세요.'
    },
    TEAM_A_ATTACK: {
      title: 'A팀 이의제기 시간',
      description: 'A팀이 코드의 문제점을 지적하세요'
    },
    TEAM_B_ATTACK: {
      title: 'B팀 이의제기 시간',
      description: 'B팀이 코드의 문제점을 지적하세요'
    },
    TEAM_SWITCH: {
      title: '팀 변경 시간',
      description: '팀을 변경할 수 있는 시간입니다.'
    }
  };

  const turnMap: Record<TurnStatus, TurnInfo> = {
    A_ATTACK: {
      title: 'A팀 이의제기 시간',
      description: 'A팀이 코드의 문제점을 지적하세요.'
    },
    B_ATTACK: {
      title: 'B팀 이의제기 시간',
      description: 'B팀이 코드의 문제점을 지적하세요.'
    },
    A_DEFENSE: {
      title: 'A팀 반론 시간',
      description: 'B팀의 이의제기에 반론하세요.'
    },
    B_DEFENSE: {
      title: 'B팀 반론 시간',
      description: 'A팀의 이의제기에 반론하세요.'
    }
  };

  if (stage in turnMap) {
    return turnMap[stage as TurnStatus];
  }

  if (stage in phaseMap) {
    return phaseMap[stage as BattlePhase];
  }

  return {
    title: stage,
    description: '현재 진행 중인 단계입니다.'
  };
};
