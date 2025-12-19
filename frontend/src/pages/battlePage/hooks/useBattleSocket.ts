import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  BattleJoinData,
  UseBattleSocketProps,
  BattleProgressState,
  BattleAttackedResult,
  BattleDefensedResult
} from '@/commons/types/battle';

export function useBattleSocket({ battleId, userId, team, password }: UseBattleSocketProps) {
  const [battleData, setBattleData] = useState<BattleJoinData | null>(null);
  const [battleProgress, setBattleProgressState] = useState<BattleProgressState | null>(null);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('/', {
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
    newSocket.on('battle:joined', (data: BattleJoinData) => {
      setBattleData(data);

      // 초기 battleState 설정
      setBattleProgressState({
        round: data.round,
        phase: data.phase,
        turn: data.turn,
        startedAt: data.startedAt,
        expiredAt: data.expiredAt
      });

      // 초기 currentStage 설정
      setCurrentStage(data.phase);
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

    // Battle:Defensed 이벤트 구독 (방어 결과)
    newSocket.on('battle:defensed', (data: BattleDefensedResult) => {
      console.log('Battle:Defensed received:', data);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [battleId, userId, team, password]);

  return {
    socket: socketRef.current,
    battleData,
    battleProgress,
    currentStage,
    isConnected
  };
}
