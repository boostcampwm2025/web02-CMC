import { useEffect } from 'react';
import { io } from 'socket.io-client';
import type { BattleJoinData, UseBattleSocketProps } from '@/commons/types/battle';
import { useBattleStore } from '../stores/battleStore';

export function useBattleSocket({ battleId, userId, team, password }: UseBattleSocketProps) {
  const {
    setSocket,
    setIsConnected,
    setCurrentStage,
    setBattleProgress,
    setDiscussions,
    setTeamCounts,
    setTimelines,
    setChats
  } = useBattleStore();

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket']
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('battle:join', {
        userId,
        battleId,
        team,
        password
      });
    });

    // 배틀 참여 성공시 데이터 수신
    newSocket.once('battle:joined', (data: BattleJoinData) => {
      // 초기 battleState 설정
      setBattleProgress({
        round: data.round,
        phase: data.phase,
        turn: data.turn,
        startedAt: data.startedAt,
        expiredAt: data.expiredAt
      });

      if (data.phase === 'OPINION_SHARE' || data.phase === 'TEAM_SWITCH') {
        setCurrentStage(data.phase);
      } else {
        setCurrentStage(data.turn?.status || data.phase);
      }

      // 팀 인원 수, 타임라인, 채팅 데이터 store에 저장
      setTeamCounts(data.counts);
      setTimelines(data.timelines);
      setChats(data.allChats || []);

      // 초기 투표 리스트 동기화
      if (team !== 'NONE' && data.turn?.status) {
        const VOTE_MAP: Record<string, typeof data.attacks | typeof data.defenses> = {
          A_ATTACK_B: data.attacks,
          B_DEFENSE_A: data.defenses,
          B_ATTACK_A: data.attacks,
          A_DEFENSE_B: data.defenses
        };

        const currentVoteList = VOTE_MAP[`${data.turn.status}_${team}`];
        if (currentVoteList?.length) {
          const totalVotes = currentVoteList.reduce((sum, { upvotes }) => sum + upvotes, 0);
          setDiscussions(
            currentVoteList.map(({ discussionId, authorId, content, upvotes, votes }) => ({
              id: discussionId as unknown as number,
              user: authorId === userId ? 'You' : `User-${authorId.slice(0, 4)}`,
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
      newSocket.off('battle:phase:update');
      newSocket.off('battle:turn:update');
      newSocket.off('battle:round:update');
      newSocket.off('battle:attacked');
      newSocket.off('battle:defensed');
      newSocket.off('battle:attackvote:update', handleVoteUpdate);
      newSocket.off('battle:defensevote:update', handleVoteUpdate);
      newSocket.off('Battle:NewAttack', handleNewDiscussion);
      newSocket.off('Battle:NewDefense', handleNewDiscussion);
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [
    battleId,
    userId,
    team,
    password,
    setSocket,
    setIsConnected,
    setCurrentStage,
    setBattleProgress,
    setDiscussions,
    setTeamCounts,
    setTimelines,
    setChats
  ]);
}
