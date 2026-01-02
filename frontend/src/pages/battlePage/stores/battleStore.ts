import { create } from 'zustand';
import { Socket } from 'socket.io-client';
import type { BattleProgressState } from '@/commons/types/battle';

interface BattleStore {
  socket: Socket | null;
  isConnected: boolean;
  currentStage: string | null;
  battleProgress: BattleProgressState | null;

  setSocket: (socket: Socket | null) => void;
  setIsConnected: (connected: boolean) => void;
  setCurrentStage: (stage: string | null) => void;
  setBattleProgress: (progress: BattleProgressState | null) => void;
  updateBattleProgress: (updates: Partial<BattleProgressState>) => void;
}

export const useBattleStore = create<BattleStore>((set) => ({
  socket: null,
  isConnected: false,
  currentStage: null,
  battleProgress: null,

  setSocket: (socket) => set({ socket }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  setCurrentStage: (stage) => set({ currentStage: stage }),
  setBattleProgress: (progress) => set({ battleProgress: progress }),
  updateBattleProgress: (updates) =>
    set((state) => ({
      battleProgress: state.battleProgress ? { ...state.battleProgress, ...updates } : null
    }))
}));

export const selectSocket = (state: BattleStore) => state.socket;
export const selectCurrentStage = (state: BattleStore) => state.currentStage;
export const selectIsConnected: (state: BattleStore) => boolean = (state: BattleStore) => state.isConnected;
export const selectBattleProgress = (state: BattleStore) => state.battleProgress;
