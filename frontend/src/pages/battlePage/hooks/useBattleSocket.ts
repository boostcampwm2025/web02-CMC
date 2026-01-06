import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  BattleJoinData,
  UseBattleSocketProps,
  BattleProgressState,
  BattleAttackedResult,
  BattleDefensedResult
} from '@/commons/types/battle';

interface Objection {
  id: number;
  user: string;
  team: 'A' | 'B';
  content: string;
  votes: number;
  totalVotes: number;
  hasVoted: boolean;
}

export function useBattleSocket({ battleId, userId, team, password }: UseBattleSocketProps) {
  const [battleData, setBattleData] = useState<BattleJoinData | null>(null);
  const [battleProgress, setBattleProgressState] = useState<BattleProgressState | null>(null);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [objections, setObjections] = useState<Objection[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket']
    });

    socketRef.current = newSocket;

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
      setBattleData(data);

      // 초기 battleState 설정
      setBattleProgressState({
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
          setObjections(
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

    // Phase 변경 이벤트 구독
    newSocket.on('battle:phase:update', (data: BattleProgressState) => {
      setBattleProgressState((prev) =>
        prev
          ? {
              ...prev,
              phase: data.phase,
              startedAt: data.startedAt,
              expiredAt: data.expiredAt
            }
          : null
      );
      setCurrentStage(data.phase);
      setObjections([]);
    });

    // Turn 변경 이벤트 구독
    newSocket.on('battle:turn:update', (data: BattleProgressState) => {
      setBattleProgressState((prev) =>
        prev
          ? {
              ...prev,
              turn: data.turn,
              startedAt: data.startedAt,
              expiredAt: data.expiredAt
            }
          : null
      );
      setCurrentStage(data.turn?.status || null);
      setObjections([]);
    });

    // Round 변경 이벤트 구독
    newSocket.on('battle:round:update', (data: { battleId: string; round: number }) => {
      setBattleProgressState((prev) =>
        prev
          ? {
              ...prev,
              round: data.round
            }
          : null
      );
    });

    newSocket.on('battle:attacked', (data: BattleAttackedResult) => {
      console.log('Battle:Attacked received:', data);
    });

    newSocket.on('battle:defensed', (data: BattleDefensedResult) => {
      console.log('Battle:Defensed received:', data);
    });

    // 투표 업데이트 이벤트
    const handleVoteUpdate = (data: { discussionId: string; upvotes: number; votes: string[] }) => {
      setObjections((prev) => {
        const updated = prev.map((obj) => {
          const isTarget = String(obj.id) === data.discussionId;
          return isTarget ? { ...obj, votes: data.upvotes, hasVoted: data.votes.includes(userId) } : obj;
        });
        const totalVotes = updated.reduce((sum, obj) => sum + obj.votes, 0);
        return updated.map((obj) => ({ ...obj, totalVotes }));
      });
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

      setObjections((prev) => {
        const totalVotes = prev.reduce((sum, obj) => sum + obj.votes, 0);
        return [
          ...prev,
          {
            id: data.discussionId as unknown as number,
            user: data.authorId === userId ? 'You' : `User-${data.authorId.slice(0, 4)}`,
            team: team as 'A' | 'B',
            content: data.content,
            votes: data.upvotes,
            totalVotes,
            hasVoted: data.votes.includes(userId)
          }
        ];
      });
    };

    newSocket.on('battle:attackvote:update', handleVoteUpdate);
    newSocket.on('battle:defensevote:update', handleVoteUpdate);
    newSocket.on('Battle:NewAttack', handleNewDiscussion);
    newSocket.on('Battle:NewDefense', handleNewDiscussion);

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
    };
  }, [battleId, userId, team, password]);

  return {
    socket: socketRef.current,
    battleData,
    battleProgress,
    currentStage,
    isConnected,
    objections
  };
}
