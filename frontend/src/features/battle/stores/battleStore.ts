import { create } from 'zustand';
import { Socket } from 'socket.io-client';
import type { BattleProgressState, BattleDiscussion, BattleDefense, BattleChat } from '@/commons/types/battle';
import { BATTLE_CLIENT_EVENTS } from '@cmc/types';

interface BattleStore {
  userId: string;
  battleId: string;
  socket: Socket | null;
  isConnected: boolean;
  connectionError: {
    type: 'disconnected' | 'reconnecting' | 'failed' | null;
    attemptCount: number;
    message: string;
  };
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
    none: number;
  };
  totalParticipants: number;
  timelines: {
    attacks: BattleDiscussion[];
    defenses: BattleDefense[];
  } | null;
  teamChats: BattleChat[];
  allChats: BattleChat[];
  selectedTeam: 'A' | 'B' | 'NONE';
  chatInitialized: boolean;
  opponentNotice: BattleChat | null;
  opponentNoticePending: BattleChat | null;
  isTeamVoteResultShowing: boolean;
  pendingBattleClosed: boolean;

  initializeBattle: (config: { userId: string; battleId: string }) => void;
  setSocket: (socket: Socket | null) => void;
  setIsConnected: (connected: boolean) => void;
  setConnectionError: (error: {
    type: 'disconnected' | 'reconnecting' | 'failed' | null;
    attemptCount: number;
    message: string;
  }) => void;
  setCurrentStage: (stage: string | null) => void;
  setBattleProgress: (progress: BattleProgressState | null) => void;
  updateBattleProgress: (updates: Partial<BattleProgressState>) => void;
  setDiscussions: (discussions: BattleStore['discussions']) => void;
  addDiscussion: (discussion: BattleStore['discussions'][0]) => void;
  updateDiscussionVote: (discussionId: string, upvotes: number, votes: string[], userId: string) => void;
  setTeamCounts: (counts: { teamACount: number; teamBCount: number; none: number }, totalParticipants?: number) => void;
  setTimelines: (timelines: { attacks: BattleDiscussion[]; defenses: BattleDefense[] }) => void;
  addAttackTimeline: (attack: BattleDiscussion) => void;
  addDefenseTimeline: (defense: BattleDefense) => void;
  setTeamChats: (chats: BattleChat[]) => void;
  setAllChats: (chats: BattleChat[]) => void;
  addChat: (chat: BattleChat) => void;
  setSelectedTeam: (team: 'A' | 'B' | 'NONE') => void;
  setChatInitialized: (initialized: boolean) => void;
  setOpponentNoticePending: (notice: BattleChat | null) => void;
  commitOpponentNotice: () => void;
  setIsTeamVoteResultShowing: (showing: boolean) => void;
  setPendingBattleClosed: (pending: boolean) => void;
  leaveBattle: () => void;
}

export const useBattleStore = create<BattleStore>((set, get) => ({
  userId: '',
  battleId: '',
  socket: null,
  isConnected: false,
  connectionError: { type: null, attemptCount: 0, message: '' },
  currentStage: null,
  battleProgress: null,
  discussions: [],
  teamCounts: { teamACount: 0, teamBCount: 0, none: 0 },
  totalParticipants: 0,
  timelines: null,
  teamChats: [],
  allChats: [],
  selectedTeam: 'NONE',
  chatInitialized: false,
  opponentNotice: null,
  opponentNoticePending: null,
  isTeamVoteResultShowing: false,
  pendingBattleClosed: false,

  initializeBattle: (config) => {
    set({ userId: config.userId, battleId: config.battleId, chatInitialized: false });
  },
  setSocket: (socket) => set({ socket }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  setConnectionError: (error) => set({ connectionError: error }),
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

  setTeamCounts: (counts, totalParticipants) =>
    set({
      teamCounts: counts,
      totalParticipants: totalParticipants ?? counts.teamACount + counts.teamBCount
    }),
  setTimelines: (timelines) => set({ timelines }),
  addAttackTimeline: (attack) =>
    set((state) => {
      const existingAttacks = state.timelines?.attacks || [];
      const isDuplicate = existingAttacks.some((a) => a.discussionId === attack.discussionId);

      return {
        timelines: {
          attacks: isDuplicate ? existingAttacks : [...existingAttacks, attack],
          defenses: state.timelines?.defenses || []
        }
      };
    }),
  addDefenseTimeline: (defense) =>
    set((state) => {
      const existingDefenses = state.timelines?.defenses || [];
      // 중복 체크: 같은 discussionId가 이미 있으면 추가하지 않음
      const isDuplicate = existingDefenses.some((d) => d.discussionId === defense.discussionId);

      return {
        timelines: {
          attacks: state.timelines?.attacks || [],
          defenses: isDuplicate ? existingDefenses : [...existingDefenses, defense]
        }
      };
    }),
  setTeamChats: (chats) => set({ teamChats: chats }),
  setAllChats: (chats) => set({ allChats: chats }),
  addChat: (chat) =>
    set((state) => {
      if (chat.scope === 'TEAM') {
        return { teamChats: [...state.teamChats, chat] };
      } else {
        return { allChats: [...state.allChats, chat] };
      }
    }),
  setSelectedTeam: (team) => set({ selectedTeam: team }),
  setChatInitialized: (initialized) => set({ chatInitialized: initialized }),
  setOpponentNoticePending: (notice) => set({ opponentNoticePending: notice }),
  commitOpponentNotice: () =>
    set((state) => ({
      opponentNotice: state.opponentNoticePending,
      opponentNoticePending: null
    })),
  setIsTeamVoteResultShowing: (showing) => set({ isTeamVoteResultShowing: showing }),
  setPendingBattleClosed: (pending) => set({ pendingBattleClosed: pending }),
  leaveBattle: () => {
    const { socket, battleId } = get();
    socket?.emit(BATTLE_CLIENT_EVENTS.LEAVE, { battleId });

    socket?.removeAllListeners();
    socket?.disconnect();

    // 기존 Store 초기화 값으로 설정
    set({
      userId: '',
      battleId: '',
      socket: null,
      isConnected: false,
      connectionError: { type: null, attemptCount: 0, message: '' },
      currentStage: null,
      battleProgress: null,
      discussions: [],
      teamCounts: { teamACount: 0, teamBCount: 0, none: 0 },
      totalParticipants: 0,
      timelines: null,
      teamChats: [],
      allChats: [],
      selectedTeam: 'NONE',
      chatInitialized: false,
      opponentNotice: null,
      opponentNoticePending: null,
      isTeamVoteResultShowing: false,
      pendingBattleClosed: false
    });
  }
}));

// E2E 테스트용 store 노출
if (import.meta.env.DEV) {
  (window as unknown as { __battleStore__: typeof useBattleStore }).__battleStore__ = useBattleStore;
}

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
export const selectChatInitialized = (state: BattleStore) => state.chatInitialized;
export const selectOpponentNotice = (state: BattleStore) => state.opponentNotice;
