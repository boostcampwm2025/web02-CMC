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
import { soundManager } from '@/commons/utils/soundManager';

export function useBattleTimeline() {
  const socket = useBattleStore(selectSocket);
  const selectedTeam = useBattleStore(selectSelectedTeam);
  const { effectModal, showEffect, hideEffect } = useEffectModal();

  useEffect(() => {
    if (!socket) return;

    const pushTimelineAndChat = (
      battleId: string,
      team: Team,
      entry: {
        id: string | null;
        text: string | null;
        ownerId: string | null;
        nickname: string | null;
        count: number | null;
      },
      type: 'attack' | 'defense'
    ) => {
      if (!entry.id || !entry.text || !team) return;

      const discussion: BattleDiscussion | BattleDefense = {
        discussionId: entry.id,
        author: { authorId: entry.ownerId, nickname: entry.nickname },
        content: entry.text,
        upvotes: entry.count ?? 0,
        votes: [],
        status: 'SELECTED',
        type: type === 'attack' ? 'ATTACK' : 'DEFENSE',
        team: team as 'A' | 'B',
        ...(type === 'defense' ? { attackId: '' } : {})
      } as BattleDiscussion | BattleDefense;

      if (type === 'attack') {
        useBattleStore.getState().addAttackTimeline(discussion as BattleDiscussion);
      } else {
        useBattleStore.getState().addDefenseTimeline(discussion as BattleDefense);
      }

      const chatMessage: BattleChat = {
        battleId,
        scope: 'ALL',
        messageId: `${type}-${entry.id}`,
        sender: {
          userId: entry?.ownerId || '',
          nickname: entry.nickname || 'SYSTEM'
        },
        team,
        text: entry.text,
        createdAt: new Date(),
        type,
        votes: entry.count ?? 0
      };
      useBattleStore.getState().addChat(chatMessage);
    };

    const pushNullPlaceholder = (team: 'A' | 'B', type: 'attack' | 'defense') => {
      // null인 경우 placeholder 데이터 추가
      const placeholder: BattleDiscussion | BattleDefense = {
        discussionId: `null-${team}-${type}-${Date.now()}`,
        author: { authorId: '', nickname: '' },
        content: '투표로 선정된 의견이 없습니다',
        upvotes: 0,
        votes: [],
        status: 'REJECTED',
        type: type === 'attack' ? 'ATTACK' : 'DEFENSE',
        team: team,
        ...(type === 'defense' ? { attackId: '' } : {})
      } as BattleDiscussion | BattleDefense;

      if (type === 'attack') {
        useBattleStore.getState().addAttackTimeline(placeholder as BattleDiscussion);
      } else {
        useBattleStore.getState().addDefenseTimeline(placeholder as BattleDefense);
      }
    };

    const handleAttacked = (data: BattleAttackedResult) => {
      // A팀과 B팀 모두 타임라인에 추가 (A팀 먼저, B팀 나중)
      const { aTeam, bTeam } = data.attack;

      // 이펙트는 상대팀 것만 표시
      const opponentTeam = selectedTeam === 'A' ? 'B' : 'A';
      const opponentEntry = selectedTeam === 'A' ? bTeam : aTeam;

      if (opponentEntry?.id && opponentEntry?.team && opponentEntry?.text) {
        // 일반적인 경우: 투표된 의견이 있을 때
        showEffect(opponentEntry.team, opponentEntry.text, 'attack');
        soundManager.play('swordSlash', 0.6);
      } else if (!opponentEntry?.id) {
        // null인 경우: 투표된 의견이 없을 때
        showEffect(opponentTeam, '투표로 선정된 의견이 없습니다', 'attack');
      }

      if (selectedTeam !== 'NONE') {
        const noticeChat: BattleChat = {
          battleId: data.battleId,
          scope: 'ALL',
          messageId: `notice-attack-${opponentEntry?.id ?? opponentTeam}-${Date.now()}`,
          sender: {
            userId: opponentEntry?.ownerId ?? '',
            nickname: opponentEntry?.nickname ?? 'SYSTEM'
          },
          team: opponentEntry?.team ?? opponentTeam,
          text: opponentEntry?.text ?? '투표로 선정된 의견이 없습니다',
          createdAt: new Date(),
          type: 'attack',
          votes: opponentEntry?.count ?? 0
        };
        useBattleStore.getState().setOpponentNoticePending(noticeChat);
      }

      // 타임라인은 양쪽 모두 추가 (A팀 -> B팀 순서)
      if (aTeam?.team) {
        pushTimelineAndChat(data.battleId, aTeam.team, aTeam, 'attack');
      } else {
        pushNullPlaceholder('A', 'attack');
      }

      if (bTeam?.team) {
        pushTimelineAndChat(data.battleId, bTeam.team, bTeam, 'attack');
      } else {
        pushNullPlaceholder('B', 'attack');
      }
    };

    const handleDefensed = (data: BattleDefensedResult) => {
      // A팀과 B팀 모두 타임라인에 추가 (A팀 먼저, B팀 나중)
      const { aTeam, bTeam } = data.defense;

      // 이펙트는 상대팀 것만 표시
      const opponentTeam = selectedTeam === 'A' ? 'B' : 'A';
      const opponentEntry = selectedTeam === 'A' ? bTeam : aTeam;

      if (opponentEntry?.id && opponentEntry?.team && opponentEntry?.text) {
        // 일반적인 경우: 투표된 의견이 있을 때
        showEffect(opponentEntry.team, opponentEntry.text, 'defense');
        soundManager.play('swordSlash', 0.6);
      } else if (!opponentEntry?.id) {
        // null인 경우: 투표된 의견이 없을 때
        showEffect(opponentTeam, '투표로 선정된 의견이 없습니다', 'defense');
      }

      if (selectedTeam !== 'NONE') {
        const noticeChat: BattleChat = {
          battleId: data.battleId,
          scope: 'ALL',
          messageId: `notice-defense-${opponentEntry?.id ?? opponentTeam}-${Date.now()}`,
          sender: {
            userId: opponentEntry?.ownerId ?? '',
            nickname: opponentEntry?.nickname ?? 'SYSTEM'
          },
          team: opponentEntry?.team ?? opponentTeam,
          text: opponentEntry?.text ?? '투표로 선정된 의견이 없습니다',
          createdAt: new Date(),
          type: 'defense',
          votes: opponentEntry?.count ?? 0
        };
        useBattleStore.getState().setOpponentNoticePending(noticeChat);
      }

      // 타임라인은 양쪽 모두 추가 (A팀 -> B팀 순서)
      if (aTeam?.team) {
        pushTimelineAndChat(data.battleId, aTeam.team, aTeam, 'defense');
      } else {
        pushNullPlaceholder('A', 'defense');
      }

      if (bTeam?.team) {
        pushTimelineAndChat(data.battleId, bTeam.team, bTeam, 'defense');
      } else {
        pushNullPlaceholder('B', 'defense');
      }
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
