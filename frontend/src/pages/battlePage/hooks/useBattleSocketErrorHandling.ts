import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { useBattleStore } from '../stores/battleStore';
import { useToastStore } from '@/commons/stores/toastStore';

interface ErrorPayload {
  message: string;
}

export function useBattleSocketErrorHandling() {
  const { socket, setIsConnected, setConnectionError, battleId } = useBattleStore();
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    if (!socket) return;

    // 연결 성공 핸들러
    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionError({ type: null, attemptCount: 0, message: '' });

      Sentry.addBreadcrumb({
        category: 'websocket',
        message: 'WebSocket connected',
        level: 'info',
        data: {
          battleId,
          socketId: socket.id
        }
      });
    });

    // 재연결 성공 핸들러
    socket.io.on('reconnect', () => {
      setIsConnected(true);
      setConnectionError({ type: null, attemptCount: 0, message: '' });

      Sentry.addBreadcrumb({
        category: 'websocket',
        message: 'WebSocket reconnected',
        level: 'info',
        data: {
          battleId
        }
      });
    });

    // 연결 해제 핸들러
    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      setConnectionError({ type: 'disconnected', attemptCount: 0, message: '소켓 연결이 끊어졌습니다' });

      Sentry.addBreadcrumb({
        category: 'websocket',
        message: 'WebSocket disconnected',
        level: 'warning',
        data: {
          battleId,
          reason,
          isOnline: navigator.onLine,
          isVisible: document.visibilityState === 'visible'
        }
      });

      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    // 연결 에러 핸들러
    socket.on('connect_error', (error) => {
      setConnectionError({
        type: 'disconnected',
        attemptCount: 0,
        message: '서버 연결에 실패했습니다'
      });

      // Sentry로 연결 에러 전송
      Sentry.captureException(error, {
        level: 'error',
        tags: {
          errorType: '웹 소켓 연결 에러',
          battleId: battleId
        },
        contexts: {
          websocket: {
            socketId: socket.id,
            connected: socket.connected,
            battleId: battleId
          }
        },
        extra: {
          errorMessage: error.message
        }
      });
    });

    // 재연결 시도 핸들러
    socket.io.on('reconnect_attempt', (attemptNumber) => {
      setConnectionError({
        type: 'reconnecting',
        attemptCount: attemptNumber,
        message: `재연결 시도중 (${attemptNumber}/3)`
      });

      Sentry.addBreadcrumb({
        category: 'websocket',
        message: `Reconnecting attempt ${attemptNumber}`,
        level: 'info',
        data: {
          battleId,
          attemptNumber
        }
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
      // 센트리 재연결 실패 로그 전송
      Sentry.captureException(new Error('웹소켓 재연결 실패'), {
        level: 'error',
        tags: {
          errorType: '웹 소켓 재연결 실패',
          battleId: battleId
        },
        contexts: {
          websocket: {
            socketId: socket.id,
            connected: socket.connected,
            battleId: battleId,
            maxAttempts: 3
          }
        }
      });
    });

    // 서버 비즈니스 에러 핸들러
    socket.on('battle:join:error', (data: ErrorPayload) => {
      addToast({ message: data.message || '배틀 입장에 실패했습니다.' });
    });

    socket.on('battle:attack:error', (data: ErrorPayload) => {
      addToast({ message: data.message || '공격 제출에 실패했습니다.' });
    });

    socket.on('battle:defense:error', (data: ErrorPayload) => {
      addToast({ message: data.message || '방어 제출에 실패했습니다.' });
    });

    socket.on('battle:attack:vote:error', (data: ErrorPayload) => {
      addToast({ message: data.message || '투표에 실패했습니다.' });
    });

    socket.on('battle:defense:vote:error', (data: ErrorPayload) => {
      addToast({ message: data.message || '투표에 실패했습니다.' });
    });

    socket.on('battle:chat:error', (data: ErrorPayload) => {
      addToast({ message: data.message || '메시지 전송에 실패했습니다.' });
    });

    socket.on('battle:team:vote:error', (data: ErrorPayload) => {
      addToast({ message: data.message || '팀 투표에 실패했습니다.' });
    });

    socket.on('battle:user:skip:error', (data: ErrorPayload) => {
      addToast({ message: data.message || '스킵 요청에 실패했습니다.' });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.io.off('reconnect');
      socket.io.off('reconnect_attempt');
      socket.io.off('reconnect_failed');
      socket.off('battle:phase:updated');
      socket.off('battle:join:error');
      socket.off('battle:attack:error');
      socket.off('battle:defense:error');
      socket.off('battle:attack:vote:error');
      socket.off('battle:defense:vote:error');
      socket.off('battle:chat:error');
      socket.off('battle:team:vote:error');
      socket.off('battle:user:skip:error');
    };
  }, [socket, setIsConnected, setConnectionError, addToast]);
}
