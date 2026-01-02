import { useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { useBattleStore, selectBattleProgress, selectDiscussions } from '../stores/battleStore';
import { getObjectionConfig, isInputDisabled } from '../utils/battlePhase';

interface UseBattleDiscussionsProps {
  socket: Socket | null;
  userId: string;
  team: 'A' | 'B' | 'NONE';
  battleId: string;
}

export function useBattleDiscussions({ socket, userId, team, battleId }: UseBattleDiscussionsProps) {
  const { updateDiscussionVote, addDiscussion } = useBattleStore();
  const battleProgress = useBattleStore(selectBattleProgress);
  const objections = useBattleStore(selectDiscussions);

  const handleVote = useCallback(
    (objectionId: number) => {
      if (!socket || team === 'NONE') return;

      const targetObjection = objections?.find((obj) => obj.id === objectionId);
      if (targetObjection?.hasVoted) return;

      const { isAttacking } = getObjectionConfig(team, battleProgress?.phase);
      const eventName = isAttacking ? 'battle:attackvote' : 'battle:defensevote';

      socket.emit(eventName, {
        battleId,
        discussionId: String(objectionId),
        userId,
        team
      });
    },
    [socket, team, objections, battleProgress, battleId, userId]
  );

  const handleObjectionSubmit = useCallback(
    (content: string) => {
      if (team === 'NONE' || !socket) return;

      const { isAttacking } = getObjectionConfig(team, battleProgress?.phase);
      const canSubmit = !isInputDisabled(team, battleProgress?.phase, battleProgress?.turn?.status);

      if (!canSubmit) {
        return;
      }

      socket.emit(isAttacking ? 'Battle:Attack' : 'Battle:Defense', {
        battleId,
        authorId: userId,
        content,
        team
      });
    },
    [socket, team, battleProgress, battleId, userId]
  );

  useEffect(() => {
    if (!socket) return;

    // 투표 업데이트 이벤트
    const handleVoteUpdate = (data: { discussionId: string; upvotes: number; votes: string[] }) => {
      updateDiscussionVote(data.discussionId, data.upvotes, data.votes, userId);
    };

    // 새 이의제기/반론 추가
    const handleNewDiscussion = (data: {
      discussionId: string;
      authorId: string;
      content: string;
      upvotes: number;
      votes: string[];
    }) => {
      if (team === 'NONE') return;

      addDiscussion({
        id: data.discussionId as unknown as number,
        user: data.authorId === userId ? 'You' : `User-${data.authorId.slice(0, 4)}`,
        team: team as 'A' | 'B',
        content: data.content,
        votes: data.upvotes,
        totalVotes: 0,
        hasVoted: data.votes.includes(userId)
      });
    };

    socket.on('battle:attackvote:update', handleVoteUpdate);
    socket.on('battle:defensevote:update', handleVoteUpdate);
    socket.on('Battle:NewAttack', handleNewDiscussion);
    socket.on('Battle:NewDefense', handleNewDiscussion);

    return () => {
      socket.off('battle:attackvote:update', handleVoteUpdate);
      socket.off('battle:defensevote:update', handleVoteUpdate);
      socket.off('Battle:NewAttack', handleNewDiscussion);
      socket.off('Battle:NewDefense', handleNewDiscussion);
    };
  }, [socket, userId, team, updateDiscussionVote, addDiscussion]);

  return { handleVote, handleObjectionSubmit };
}
