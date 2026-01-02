import { create } from 'zustand';
import { Socket } from 'socket.io-client';

interface BattleStore {
  socket: Socket | null;
  isConnected: boolean;
  currentStage: string | null;

  setSocket: (socket: Socket | null) => void;
  setIsConnected: (connected: boolean) => void;
  setCurrentStage: (stage: string | null) => void;
}

export const useBattleStore = create<BattleStore>((set) => ({
  socket: null,
  isConnected: false,
  currentStage: null,

  setSocket: (socket) => set({ socket }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  setCurrentStage: (stage) => set({ currentStage: stage })
}));

export const selectSocket = (state: BattleStore) => state.socket;
export const selectCurrentStage = (state: BattleStore) => state.currentStage;
export const selectIsConnected: (state: BattleStore) => boolean = (state: BattleStore) => state.isConnected;
