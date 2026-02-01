import { useEffect } from 'react';
import { useBattleStore } from '../stores/battleStore';

export function useBattleSocketErrorHandling() {
  const { socket, setIsConnected, setConnectionError } = useBattleStore();

  useEffect(() => {
    if (!socket) return;

    // 연결 성공 핸들러
    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionError({ type: null, attemptCount: 0, message: '' });
    });

    // 재연결 성공 핸들러
    socket.io.on('reconnect', () => {
      setIsConnected(true);
      setConnectionError({ type: null, attemptCount: 0, message: '' });
    });

    // 연결 해제 핸들러
    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      setConnectionError({ type: 'disconnected', attemptCount: 0, message: '소켓 연결이 끊어졌습니다' });

      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    // 연결 에러 핸들러
    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      setConnectionError({
        type: 'disconnected',
        attemptCount: 0,
        message: '서버 연결에 실패했습니다'
      });
    });

    // 재연결 시도 핸들러
    socket.io.on('reconnect_attempt', (attemptNumber) => {
      console.log(`[Socket] Reconnecting... (${attemptNumber}/3)`);
      setConnectionError({
        type: 'reconnecting',
        attemptCount: attemptNumber,
        message: `재연결 시도중 (${attemptNumber}/3)`
      });
    });

    // 재연결 실패 핸들러
    socket.io.on('reconnect_failed', () => {
      setIsConnected(false);
      setConnectionError({
        type: 'failed',
        attemptCount: 3,
        message: '재연결에 실패했습니다. 다시 시도해주세요.'
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.io.off('reconnect');
      socket.io.off('reconnect_attempt');
      socket.io.off('reconnect_failed');
    };
  }, [socket, setIsConnected, setConnectionError]);
}
