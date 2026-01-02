import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useBattleStore } from '../stores/battleStore';

interface UseBattleDiscussionsProps {
  socket: Socket | null;
  userId: string;
  team: 'A' | 'B' | 'NONE';
}

export function useBattleDiscussions({ socket, userId, team }: UseBattleDiscussionsProps) {
  const { updateDiscussionVote, addDiscussion } = useBattleStore();

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
}
