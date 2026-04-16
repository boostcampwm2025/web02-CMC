import { useEffect, useCallback } from 'react';
import {
  useBattleStore,
  selectBattleProgress,
  selectDiscussions,
  selectSocket,
  selectBattleId,
  selectSelectedTeam
} from '@/features/battle/stores/battleStore';
import { getDiscussionConfig, isInputDisabled } from '@/features/battle/utils/battlePhase';
import { selectUser, useAuthStore } from '@/commons/stores/authStore';
import { soundManager } from '@/commons/utils/soundManager';

export function useBattleDiscussions() {
  const socket = useBattleStore(selectSocket);
  const user = useAuthStore(selectUser);
  const battleId = useBattleStore(selectBattleId);
  const team = useBattleStore(selectSelectedTeam);
  const { updateDiscussionVote, addDiscussion } = useBattleStore();
  const battleProgress = useBattleStore(selectBattleProgress);
  const discussions = useBattleStore(selectDiscussions);

  const handleVote = useCallback(
    (discussionId: number) => {
      if (!socket || team === 'NONE' || !user) return;

      const targetDiscussion = discussions?.find((obj) => obj.id === discussionId);
      if (targetDiscussion?.hasVoted) return;

      const { isAttacking } = getDiscussionConfig(battleProgress?.phase);
      const eventName = isAttacking ? 'battle:attack:vote' : 'battle:defense:vote';

      soundManager.play('click2');

      socket.emit(eventName, {
        battleId,
        discussionId: String(discussionId),
        userId: user.id,
        team
      });
    },
    [socket, team, discussions, battleProgress, battleId, user]
  );

  const handleDiscussionSubmit = useCallback(
    (content: string) => {
      if (team === 'NONE' || !socket || !user) return;

      const { isAttacking } = getDiscussionConfig(battleProgress?.phase);
      const canSubmit = !isInputDisabled(team, battleProgress?.phase);

      if (!canSubmit) {
        return;
      }

      socket.emit(isAttacking ? 'battle:attack' : 'battle:defense', {
        battleId,
        authorId: user.id,
        content,
        team
      });
    },
    [socket, team, battleProgress, battleId, user]
  );

  useEffect(() => {
    if (!socket || !user) return;

    // 투표 업데이트 이벤트
    const handleVoteUpdate = (data: { discussionId: string; upvotes: number; votes: string[] }) => {
      if (!user) return;
      updateDiscussionVote(data.discussionId, data.upvotes, data.votes, user.id);
    };

    // 새 이의제기/반론 추가
    const handleNewDiscussion = (data: {
      discussionId: string;
      author: { id: string; nickname: string };
      content: string;
      upvotes: number;
      votes: string[];
    }) => {
      if (team === 'NONE') return;

      addDiscussion({
        id: data.discussionId as unknown as number,
        user: data.author.id === user.id ? 'You' : data.author.nickname,
        team: team as 'A' | 'B',
        content: data.content,
        votes: data.upvotes,
        totalVotes: 0,
        hasVoted: data.votes.includes(user.id)
      });

      soundManager.play('notificationPing');
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
  }, [socket, user, team, updateDiscussionVote, addDiscussion]);

  return { handleVote, handleDiscussionSubmit };
}
