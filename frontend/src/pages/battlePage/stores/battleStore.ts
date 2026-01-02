import { create } from 'zustand';
import { Socket } from 'socket.io-client';
import type { BattleProgressState, BattleDiscussion, BattleDefense, BattleChat } from '@/commons/types/battle';

interface BattleStore {
  socket: Socket | null;
  isConnected: boolean;
  currentStage: string | null;
  battleProgress: BattleProgressState | null;
  discussions: Array<{
    id: number;
    user: string;
    team: 'A' | 'B';
    content: string;
    votes: number;
    totalVotes: number;
    hasVoted: boolean;
  }>;
  teamCounts: {
    teamA: number;
    teamB: number;
  } | null;
  timelines: {
    attacks: BattleDiscussion[];
    defenses: BattleDefense[];
  } | null;
  chats: BattleChat[];

  setSocket: (socket: Socket | null) => void;
  setIsConnected: (connected: boolean) => void;
  setCurrentStage: (stage: string | null) => void;
  setBattleProgress: (progress: BattleProgressState | null) => void;
  updateBattleProgress: (updates: Partial<BattleProgressState>) => void;
  setDiscussions: (discussions: BattleStore['discussions']) => void;
  addDiscussion: (discussion: BattleStore['discussions'][0]) => void;
  updateDiscussionVote: (discussionId: string, upvotes: number, votes: string[], userId: string) => void;
  setTeamCounts: (counts: { teamA: number; teamB: number }) => void;
  setTimelines: (timelines: { attacks: BattleDiscussion[]; defenses: BattleDefense[] }) => void;
  setChats: (chats: BattleChat[]) => void;
  addChat: (chat: BattleChat) => void;
}

export const useBattleStore = create<BattleStore>((set) => ({
  socket: null,
  isConnected: false,
  currentStage: null,
  battleProgress: null,
  discussions: [],
  teamCounts: null,
  timelines: null,
  chats: [],

  setSocket: (socket) => set({ socket }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  setCurrentStage: (stage) => set({ currentStage: stage }),
  setBattleProgress: (progress) => set({ battleProgress: progress }),
  updateBattleProgress: (updates) =>
    set((state) => ({
      battleProgress: state.battleProgress ? { ...state.battleProgress, ...updates } : null
    })),

  setDiscussions: (discussions) => set({ discussions }),
  addDiscussion: (discussion) =>
    set((state) => ({
      discussions: [...state.discussions, discussion]
    })),
  updateDiscussionVote: (discussionId, upvotes, votes, userId) =>
    set((state) => {
      const updated = state.discussions.map((obj) => {
        const isTarget = String(obj.id) === discussionId;
        return isTarget ? { ...obj, votes: upvotes, hasVoted: votes.includes(userId) } : obj;
      });
      const totalVotes = updated.reduce((sum, obj) => sum + obj.votes, 0);
      return {
        discussions: updated.map((obj) => ({ ...obj, totalVotes }))
      };
    }),

  setTeamCounts: (counts) => set({ teamCounts: counts }),
  setTimelines: (timelines) => set({ timelines }),
  setChats: (chats) => set({ chats }),
  addChat: (chat) =>
    set((state) => ({
      chats: [...state.chats, chat]
    }))
}));

export const selectSocket = (state: BattleStore) => state.socket;
export const selectCurrentStage = (state: BattleStore) => state.currentStage;
export const selectIsConnected: (state: BattleStore) => boolean = (state: BattleStore) => state.isConnected;
export const selectBattleProgress = (state: BattleStore) => state.battleProgress;
export const selectDiscussions = (state: BattleStore) => state.discussions;
export const selectTeamCounts = (state: BattleStore) => state.teamCounts;
export const selectTimelines = (state: BattleStore) => state.timelines;
export const selectChats = (state: BattleStore) => state.chats;
