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
        aTeam: { id: string | null; text: string | null; ownerId: string | null; count: number | null };
        bTeam: { id: string | null; text: string | null; ownerId: string | null; count: number | null };
      },
      userTeam: Team
    ) => {
      const entry = userTeam === 'B' ? payload.aTeam : payload.bTeam;
      if (entry && entry.id) return { team: userTeam, entry };

      if (payload.aTeam?.id) return { team: 'A' as Team, entry: payload.aTeam };
      if (payload.bTeam?.id) return { team: 'B' as Team, entry: payload.bTeam };
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
