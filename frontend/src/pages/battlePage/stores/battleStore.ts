import { create } from 'zustand';
import { Socket } from 'socket.io-client';
import type { BattleProgressState, BattleDiscussion, BattleDefense, BattleChat } from '@/commons/types/battle';

interface BattleStore {
  userId: string;
  battleId: string;
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
    teamACount: number;
    teamBCount: number;
  };
  timelines: {
    attacks: BattleDiscussion[];
    defenses: BattleDefense[];
  } | null;
  teamChats: BattleChat[];
  allChats: BattleChat[];
  selectedTeam: 'A' | 'B' | 'NONE';

  initializeBattle: (config: { userId: string; battleId: string }) => void;
  setSocket: (socket: Socket | null) => void;
  setIsConnected: (connected: boolean) => void;
  setCurrentStage: (stage: string | null) => void;
  setBattleProgress: (progress: BattleProgressState | null) => void;
  updateBattleProgress: (updates: Partial<BattleProgressState>) => void;
  setDiscussions: (discussions: BattleStore['discussions']) => void;
  addDiscussion: (discussion: BattleStore['discussions'][0]) => void;
  updateDiscussionVote: (discussionId: string, upvotes: number, votes: string[], userId: string) => void;
  setTeamCounts: (counts: { teamACount: number; teamBCount: number }) => void;
  setTimelines: (timelines: { attacks: BattleDiscussion[]; defenses: BattleDefense[] }) => void;
  addAttackTimeline: (attack: BattleDiscussion) => void;
  addDefenseTimeline: (defense: BattleDefense) => void;
  setTeamChats: (chats: BattleChat[]) => void;
  setAllChats: (chats: BattleChat[]) => void;
  addChat: (chat: BattleChat) => void;
  setSelectedTeam: (team: 'A' | 'B' | 'NONE') => void;
}

export const useBattleStore = create<BattleStore>((set) => ({
  userId: '',
  battleId: '',
  socket: null,
  isConnected: false,
  currentStage: null,
  battleProgress: null,
  discussions: [],
  teamCounts: { teamACount: 0, teamBCount: 0 },
  timelines: null,
  teamChats: [],
  allChats: [],
  selectedTeam: 'NONE',

  initializeBattle: (config) => set({ userId: config.userId, battleId: config.battleId }),
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
  addAttackTimeline: (attack) =>
    set((state) => ({
      timelines: {
        attacks: [...(state.timelines?.attacks || []), attack],
        defenses: state.timelines?.defenses || []
      }
    })),
  addDefenseTimeline: (defense) =>
    set((state) => ({
      timelines: {
        attacks: state.timelines?.attacks || [],
        defenses: [...(state.timelines?.defenses || []), defense]
      }
    })),
  setTeamChats: (chats) => set({ teamChats: chats }),
  setAllChats: (chats) => set({ allChats: chats }),
  addChat: (chat) =>
    set((state) => {
      if (chat.scope === 'TEAM') {
        return { teamChats: [...state.teamChats, chat] };
      } else {
        return {
          allChats: [...state.allChats, chat],
          teamChats: [...state.teamChats, chat]
        };
      }
    }),
  setSelectedTeam: (team) => set({ selectedTeam: team })
}));

export const selectUserId = (state: BattleStore) => state.userId;
export const selectBattleId = (state: BattleStore) => state.battleId;
export const selectSocket = (state: BattleStore) => state.socket;
export const selectCurrentStage = (state: BattleStore) => state.currentStage;
export const selectIsConnected: (state: BattleStore) => boolean = (state: BattleStore) => state.isConnected;
export const selectBattleProgress = (state: BattleStore) => state.battleProgress;
export const selectDiscussions = (state: BattleStore) => state.discussions;
export const selectTeamCounts = (state: BattleStore) => state.teamCounts;
export const selectTimelines = (state: BattleStore) => state.timelines;
export const selectTeamChats = (state: BattleStore) => state.teamChats;
export const selectAllChats = (state: BattleStore) => state.allChats;
export const selectSelectedTeam = (state: BattleStore) => state.selectedTeam;
