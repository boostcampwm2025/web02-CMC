import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { BattleJoinData, UseBattleSocketProps } from '@/commons/types/battle';

export function useBattleSocket({ battleId, userId, team, password }: UseBattleSocketProps) {
  const [battleData, setBattleData] = useState<BattleJoinData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
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
    newSocket.on('battle:joined', (data: BattleJoinData) => {
      setBattleData(data);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [battleId, userId, team, password]);

  return {
    socket: socketRef.current,
    battleData,
    isConnected
  };
}
