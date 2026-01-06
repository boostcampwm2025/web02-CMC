import { useEffect } from 'react';
import type {
  BattleAttackedResult,
  BattleDefensedResult,
  BattleDiscussion,
  BattleDefense,
  BattleChat
} from '@/commons/types/battle';
import { useBattleStore, selectBattleProgress, selectSocket } from '../stores/battleStore';
import { useEffectModal } from './useEffectModal';

export function useBattleTimeline() {
  const socket = useBattleStore(selectSocket);
  const battleProgress = useBattleStore(selectBattleProgress);
  const { effectModal, showEffect, hideEffect } = useEffectModal();

  useEffect(() => {
    if (!socket) return;

    const handleAttacked = (data: BattleAttackedResult) => {
      // 턴 상태로 공격하는 팀 판단
      const attackingTeam = battleProgress?.turn?.status === 'A_ATTACK' ? 'A' : 'B';
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
      // 턴 상태로 방어하는 팀 판단
      const defendingTeam = battleProgress?.turn?.status === 'A_DEFENSE' ? 'A' : 'B';
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
  }, [socket, battleProgress?.turn?.status, showEffect]);

  return { effectModal, hideEffect };
}
