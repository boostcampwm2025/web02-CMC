import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import type { BattleJoinData } from '@/commons/types/battle';
import { useBattleStore } from '../stores/battleStore';
import { useAuthStore, selectUser } from '@/commons/stores/authStore';

export function useBattleSocket() {
  const { id: battleIdFromUrl } = useParams<{ id: string }>();
  const {
    battleId: battleIdFromStore,
    selectedTeam,
    setSocket,
    setIsConnected,
    setCurrentStage,
    setBattleProgress,
    setDiscussions,
    setTeamCounts,
    setTimelines,
    setTeamChats,
    setAllChats,
    setChatInitialized
  } = useBattleStore();
  const user = useAuthStore(selectUser);

  useEffect(() => {
    if (!user) return;

    const userId = user.id;
    const battleId = battleIdFromUrl || battleIdFromStore;

    if (!userId || !battleId) return;

    const newSocket = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket'],
      auth: { userId },
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      timeout: 5000,
      upgrade: false
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('battle:join', {
        userId,
        battleId,
        team: selectedTeam,
        nickname: user.nickname
      });
    });

    // 배틀 참여 성공시 데이터 동기화
    newSocket.on('battle:joined', (data: BattleJoinData) => {
      // 초기 battleState 설정
      setBattleProgress({
        round: data.round,
        topic: data.topics[data.round - 1],
        phase: data.phase,
        phaseCount: data.phaseCount,
        startedAt: data.startedAt,
        expiredAt: data.expiredAt
      });

      setCurrentStage(data.phase);

      // 팀 인원 수, 타임라인, 채팅 데이터 store에 저장
      setTeamCounts({
        teamACount: data.counts.teamA,
        teamBCount: data.counts.teamB,
        none: data.counts.teamNone
      });
      setTimelines(data.timelines);
      setTeamChats(data.chats || []);
      setAllChats(data.allChats || []);
      setChatInitialized(true);

      // 적팀 최신 공지 설정
      const currentTeam = useBattleStore.getState().selectedTeam;
      if (currentTeam !== 'NONE') {
        const opponentTeam = currentTeam === 'A' ? 'B' : 'A';
        const allDiscussions = [
          ...(data.timelines?.attacks || []).map((d) => ({ ...d, discussionType: 'attack' as const })),
          ...(data.timelines?.defenses || []).map((d) => ({ ...d, discussionType: 'defense' as const }))
        ];

        const latest = allDiscussions
          .filter((d) => d.team === opponentTeam)
          .sort((a, b) => (b.selectedAt || 0) - (a.selectedAt || 0))[0];

        if (latest) {
          useBattleStore.getState().setOpponentNoticePending({
            battleId: data.battleId,
            scope: 'ALL',
            messageId: `notice-${latest.discussionType}-${latest.discussionId}`,
            sender: { userId: latest.author.id, nickname: latest.author.nickname },
            team: latest.team,
            text: latest.content,
            createdAt: new Date(latest.selectedAt || Date.now()),
            type: latest.discussionType,
            votes: latest.upvotes
          });
          useBattleStore.getState().commitOpponentNotice();
        }
      }

      // 초기 투표 리스트 동기화 (ATTACK/DEFENSE 페이즈만)
      const team = useBattleStore.getState().selectedTeam;
      if (team !== 'NONE') {
        const currentVoteList =
          data.phase === 'ATTACK' ? data.attacks : data.phase === 'DEFENSE' ? data.defenses : null;

        if (currentVoteList?.length) {
          const totalVotes = currentVoteList.reduce((sum, { upvotes }) => sum + upvotes, 0);
          setDiscussions(
            currentVoteList.map(({ discussionId, author, content, upvotes, votes }) => ({
              id: discussionId as unknown as number,
              // user: authorId === userId ? 'You' : `User-${authorId.slice(0, 4)}`,
              user: author.id === userId ? 'You' : author.nickname,
              team: team as 'A' | 'B',
              content,
              votes: upvotes,
              totalVotes,
              hasVoted: votes.includes(userId)
            }))
          );
        }
      }
    });

    newSocket.on('battle:leaved', (data) => {
      setTeamCounts({
        teamACount: data.counts.teamA,
        teamBCount: data.counts.teamB,
        none: data.counts.teamNone
      });
    });

    return () => {
      newSocket.off('connect');
      newSocket.off('battle:joined');
      newSocket.off('battle:phase:updated');
      newSocket.off('battle:round:updated');
      newSocket.off('battle:attacked');
      newSocket.off('battle:defensed');
      newSocket.off('battle:attack:voted');
      newSocket.off('battle:defense:voted');
      newSocket.off('battle:attack:created');
      newSocket.off('battle:defense:created');
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
