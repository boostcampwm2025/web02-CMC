import { useEffect } from 'react';
import { io } from 'socket.io-client';
import type { BattleJoinData } from '@/commons/types/battle';
import { useBattleStore } from '../stores/battleStore';

export function useBattleSocket() {
  const {
    userId,
    battleId,
    selectedTeam,
    setSocket,
    setIsConnected,
    setCurrentStage,
    setBattleProgress,
    setDiscussions,
    setTeamCounts,
    setTimelines,
    setTeamChats,
    setAllChats,
    setChatInitialized
  } = useBattleStore();

  useEffect(() => {
    if (!userId || !battleId) return;

    const newSocket = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket'],
      auth: { userId }
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('battle:join', {
        userId,
        battleId,
        team: selectedTeam
      });
    });

    // 배틀 참여 성공시 데이터 수신
    newSocket.once('battle:joined', (data: BattleJoinData) => {
      // 초기 battleState 설정
      setBattleProgress({
        round: data.round,
        topic: data.topics[data.round - 1],
        phase: data.phase,
        phaseCount: data.phaseCount,
        startedAt: data.startedAt,
        expiredAt: data.expiredAt
      });

      setCurrentStage(data.phase);

      // 팀 인원 수, 타임라인, 채팅 데이터 store에 저장
      setTeamCounts({
        teamACount: data.counts.teamA,
        teamBCount: data.counts.teamB,
        none: data.counts.teamNone
      });
      setTimelines(data.timelines);
      setTeamChats(data.chats || []);
      setAllChats(data.allChats || []);
      setChatInitialized(true);

      // 초기 투표 리스트 동기화 (ATTACK/DEFENSE 페이즈만)
      const team = useBattleStore.getState().selectedTeam;
      if (team !== 'NONE') {
        const currentVoteList =
          data.phase === 'ATTACK' ? data.attacks : data.phase === 'DEFENSE' ? data.defenses : null;

        if (currentVoteList?.length) {
          const totalVotes = currentVoteList.reduce((sum, { upvotes }) => sum + upvotes, 0);
          setDiscussions(
            currentVoteList.map(({ discussionId, author, content, upvotes, votes }) => ({
              id: discussionId as unknown as number,
              // user: authorId === userId ? 'You' : `User-${authorId.slice(0, 4)}`,
              user: author.id === userId ? 'You' : author.nickname,
              team: team as 'A' | 'B',
              content,
              votes: upvotes,
              totalVotes,
              hasVoted: votes.includes(userId)
            }))
          );
        }
      }
    });

    return () => {
      newSocket.off('connect');
      newSocket.off('battle:joined');
      newSocket.off('battle:phase:updated');
      newSocket.off('battle:round:updated');
      newSocket.off('battle:attacked');
      newSocket.off('battle:defensed');
      newSocket.off('battle:attack:voted');
      newSocket.off('battle:defense:voted');
      newSocket.off('battle:attack:created');
      newSocket.off('battle:defense:created');
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    userId,
    battleId,
    setSocket,
    setIsConnected,
    setCurrentStage,
    setBattleProgress,
    setDiscussions,
    setTeamCounts,
    setTimelines,
    setTeamChats,
    setAllChats,
    setChatInitialized
  ]);
}
