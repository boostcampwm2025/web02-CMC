import { useState, useCallback } from 'react';

// vote result modal이 먼저 떠야하기에 isPending으로 관리
interface RoundUpdateState {
  isPending: boolean;
  round: number;
  topic: string;
}

export function useRoundUpdateModal() {
  const [roundModal, setRoundUpdateModal] = useState<RoundUpdateState>({
    isPending: false,
    round: 0,
    topic: ''
  });

  const showEffect = useCallback((round: number, topic: string) => {
    setRoundUpdateModal({
      isPending: true,
      round,
      topic
    });
  }, []);

  const hideEffect = useCallback(() => {
    setRoundUpdateModal((prev) => ({ ...prev, isPending: false }));
  }, []);

  return {
    roundModal,
    showEffect,
    hideEffect
  };
}
