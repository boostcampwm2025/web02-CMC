import { useEffect } from 'react';
import type {
  BattleAttackedResult,
  BattleDefensedResult,
  BattleDiscussion,
  BattleDefense,
  BattleChat,
  Team
} from '@/commons/types/battle';
import { useBattleStore, selectSelectedTeam, selectSocket } from '../stores/battleStore';
import { useEffectModal } from './useEffectModal';

export function useBattleTimeline() {
  const socket = useBattleStore(selectSocket);
  const selectedTeam = useBattleStore(selectSelectedTeam);
  const { effectModal, showEffect, hideEffect } = useEffectModal();

  const resolveTeam = (fallback: Team): Team => {
    if (selectedTeam !== 'NONE') return selectedTeam;
    return fallback;
  };

  useEffect(() => {
    if (!socket) return;

    const handleAttacked = (data: BattleAttackedResult) => {
      // ATTACK 페이즈: 양 팀 모두 공격 가능, 사용자 팀 기준으로 표시
      const attackingTeam = resolveTeam('NONE');
      showEffect(attackingTeam, data.attack.text, 'attack');

      // 타임라인에 이의제기 추가
      const attackDiscussion: BattleDiscussion = {
        discussionId: data.attack.discussionId,
        authorId: data.attack.authorId,
        content: data.attack.text,
        upvotes: data.attack.upvotes,
        votes: [],
        status: 'SELECTED',
        type: 'ATTACK'
      };
      useBattleStore.getState().addAttackTimeline(attackDiscussion);

      // 채팅방에 선정된 이의제기 메시지 추가
      const attackChatMessage: BattleChat = {
        battleId: data.battleId,
        scope: 'ALL' as const,
        messageId: `attack-${data.attack.discussionId}`,
        sender: 'SYSTEM',
        team: attackingTeam,
        text: data.attack.text,
        createdAt: new Date(),
        type: 'attack'
      };
      useBattleStore.getState().addChat(attackChatMessage);
    };

    const handleDefensed = (data: BattleDefensedResult) => {
      // DEFENSE 페이즈: 양 팀 모두 방어 가능, 사용자 팀 기준으로 표시
      const defendingTeam = resolveTeam('NONE');
      showEffect(defendingTeam, data.defense.text, 'defense');

      // 타임라인에 반론 추가
      const defenseDiscussion: BattleDefense = {
        discussionId: data.defense.discussionId,
        authorId: data.defense.authorId,
        content: data.defense.text,
        upvotes: data.defense.upvotes,
        votes: [],
        status: 'SELECTED',
        type: 'DEFENSE',
        attackId: '' // 서버에서 제공하지 않으면 빈 문자열
      };
      useBattleStore.getState().addDefenseTimeline(defenseDiscussion);

      // 채팅방에 선정된 반론 메시지 추가
      const defenseChatMessage: BattleChat = {
        battleId: data.battleId,
        scope: 'ALL' as const,
        messageId: `defense-${data.defense.discussionId}`,
        sender: 'SYSTEM',
        team: defendingTeam,
        text: data.defense.text,
        createdAt: new Date(),
        type: 'defense'
      };
      useBattleStore.getState().addChat(defenseChatMessage);
    };

    socket.on('battle:attacked', handleAttacked);
    socket.on('battle:defensed', handleDefensed);

    return () => {
      socket.off('battle:attacked', handleAttacked);
      socket.off('battle:defensed', handleDefensed);
    };
  }, [socket, showEffect, selectedTeam]);

  return { effectModal, hideEffect };
}
