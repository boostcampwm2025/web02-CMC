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

  useEffect(() => {
    if (!socket) return;

    const pickEntry = (
      payload: {
        aTeam: { id: string | null; text: string | null; ownerId: string | null; count: number | null; team: Team | null };
        bTeam: { id: string | null; text: string | null; ownerId: string | null; count: number | null; team: Team | null };
      },
      userTeam: Team
    ) => {
      // 상대팀의 결과 표시
      const opponentEntry = userTeam === 'A' ? payload.bTeam : payload.aTeam;
      if (opponentEntry?.id && opponentEntry?.team) {
        return { team: opponentEntry.team, entry: opponentEntry };
      }
      return null;
    };

    const pushTimelineAndChat = (
      battleId: string,
      team: Team,
      entry: { id: string | null; text: string | null; ownerId: string | null; count: number | null },
      type: 'attack' | 'defense'
    ) => {
      if (!entry.id || !entry.text) return;

      const discussion: BattleDiscussion | BattleDefense = {
        discussionId: entry.id,
        authorId: entry.ownerId ?? '',
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
        sender: 'SYSTEM',
        team,
        text: entry.text,
        createdAt: new Date(),
        type
      };
      useBattleStore.getState().addChat(chatMessage);
    };

    const handleAttacked = (data: BattleAttackedResult) => {
      const target = pickEntry(data.attack, selectedTeam);
      if (target) {
        showEffect(target.team, target.entry.text ?? '', 'attack');
        pushTimelineAndChat(data.battleId, target.team, target.entry, 'attack');
      }
    };

    const handleDefensed = (data: BattleDefensedResult) => {
      const target = pickEntry(data.defense, selectedTeam);
      if (target) {
        showEffect(target.team, target.entry.text ?? '', 'defense');
        pushTimelineAndChat(data.battleId, target.team, target.entry, 'defense');
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
