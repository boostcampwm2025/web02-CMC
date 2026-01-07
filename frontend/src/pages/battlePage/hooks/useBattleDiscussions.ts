import { useEffect, useCallback } from 'react';
import {
  useBattleStore,
  selectBattleProgress,
  selectDiscussions,
  selectSocket,
  selectUserId,
  selectBattleId,
  selectSelectedTeam
} from '../stores/battleStore';
import { getDiscussionConfig, isInputDisabled } from '../utils/battlePhase';

export function useBattleDiscussions() {
  const socket = useBattleStore(selectSocket);
  const userId = useBattleStore(selectUserId);
  const battleId = useBattleStore(selectBattleId);
  const team = useBattleStore(selectSelectedTeam);
  const { updateDiscussionVote, addDiscussion } = useBattleStore();
  const battleProgress = useBattleStore(selectBattleProgress);
  const discussions = useBattleStore(selectDiscussions);

  const handleVote = useCallback(
    (discussionId: number) => {
      if (!socket || team === 'NONE') return;

      const targetDiscussion = discussions?.find((obj) => obj.id === discussionId);
      if (targetDiscussion?.hasVoted) return;

      const { isAttacking } = getDiscussionConfig(team, battleProgress?.phase);
      const eventName = isAttacking ? 'battle:attackvote' : 'battle:defensevote';

      socket.emit(eventName, {
        battleId,
        discussionId: String(discussionId),
        userId,
        team
      });
    },
    [socket, team, discussions, battleProgress, battleId, userId]
  );

  const handleDiscussionSubmit = useCallback(
    (content: string) => {
      if (team === 'NONE' || !socket) return;

      const { isAttacking } = getDiscussionConfig(team, battleProgress?.phase);
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

    socket.on('battle:attack:voted', handleVoteUpdate);
    socket.on('battle:defense:voted', handleVoteUpdate);
    socket.on('battle:attack:created', handleNewDiscussion);
    socket.on('battle:defense:created', handleNewDiscussion);

    return () => {
      socket.off('battle:attack:voted', handleVoteUpdate);
      socket.off('battle:defense:voted', handleVoteUpdate);
      socket.off('battle:attack:created', handleNewDiscussion);
      socket.off('battle:defense:created', handleNewDiscussion);
    };
  }, [socket, userId, team, updateDiscussionVote, addDiscussion]);

  return { handleVote, handleDiscussionSubmit };
}
