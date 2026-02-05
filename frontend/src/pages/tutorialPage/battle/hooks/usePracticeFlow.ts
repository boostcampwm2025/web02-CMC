import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BattlePhase } from '@/commons/types/battle';
import { useBattleStore, selectBattleProgress } from '@/pages/battlePage/stores/battleStore';
import { useAuthStore } from '@/commons/stores/authStore';
import { soundManager } from '@/commons/utils/soundManager';
import { TUTORIAL_ATTACK_MESSAGES, TUTORIAL_BATTLE_ID } from '@/pages/tutorialPage/const/tutorialBattle';

const ATTACK_DISCUSSIONS = [
  {
    id: 101,
    user: '리뷰장인',
    team: 'B' as const,
    content: 'B안은 블록이 명확해서 조건 분기가 눈에 잘 들어옵니다.',
    votes: 6,
    totalVotes: 10,
    hasVoted: false
  },
  {
    id: 102,
    user: '알고리즘러',
    team: 'A' as const,
    content: 'A안은 한 줄 if로 의도가 바로 보여서 읽기 빠릅니다.',
    votes: 4,
    totalVotes: 10,
    hasVoted: false
  }
];

const DEFENSE_DISCUSSIONS = [
  {
    id: 201,
    user: '클린코더',
    team: 'A' as const,
    content: '한 줄 if는 early return 패턴을 강조해 흐름이 깔끔합니다.',
    votes: 5,
    totalVotes: 9,
    hasVoted: false
  },
  {
    id: 202,
    user: '실무파',
    team: 'B' as const,
    content: '블록 스타일은 팀 규칙에 맞추기 쉬워 확장성이 좋습니다.',
    votes: 4,
    totalVotes: 9,
    hasVoted: false
  }
];

interface PracticeFlowOptions {
  currentStep: string;
  onOpenTeamChangeModal: () => void;
}

export function usePracticeFlow({ currentStep, onOpenTeamChangeModal }: PracticeFlowOptions) {
  const battleProgress = useBattleStore(selectBattleProgress);
  const [practicePhase, setPracticePhase] = useState<'idle' | 'attack' | 'defense' | 'teamSwitch' | 'done'>('idle');
  const phaseCycleRef = useRef<1 | 2>(1);
  const [introOverride, setIntroOverride] = useState<string | null>(null);
  const [attackSubmitted, setAttackSubmitted] = useState(false);
  const [attackVoted, setAttackVoted] = useState(false);
  const [defenseSubmitted, setDefenseSubmitted] = useState(false);
  const [defenseVoted, setDefenseVoted] = useState(false);
  const [teamSwitched, setTeamSwitched] = useState(false);
  const [practiceIntroVisible, setPracticeIntroVisible] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);
  const practiceCardRef = useRef<HTMLDivElement | null>(null);
  const [cornerOffset, setCornerOffset] = useState({ x: 0, y: 0 });
  const [teamSwitchModalOpened, setTeamSwitchModalOpened] = useState(false);
  const [defenseEffectShown, setDefenseEffectShown] = useState(false);
  const [effectModal, setEffectModal] = useState<{
    isOpen: boolean;
    team: 'A' | 'B';
    content: string;
    type: 'attack' | 'defense';
  }>({
    isOpen: false,
    team: 'A',
    content: '',
    type: 'attack'
  });

  const showMissionFocus = practicePhase !== 'idle' && !practiceIntroVisible;
  const needsAttackSubmit = showMissionFocus && practicePhase === 'attack' && !attackSubmitted;
  const needsAttackVote = showMissionFocus && practicePhase === 'attack' && attackSubmitted && !attackVoted;
  const needsDefenseSubmit = showMissionFocus && practicePhase === 'defense' && !defenseSubmitted;
  const needsDefenseVote = showMissionFocus && practicePhase === 'defense' && defenseSubmitted && !defenseVoted;
  const needsTeamSwitch = showMissionFocus && practicePhase === 'teamSwitch' && !teamSwitched;

  const typingMessage = useMemo(() => {
    if (introOverride) return introOverride;
    if (practicePhase === 'teamSwitch') {
      return '팀 전환 턴입니다.\n진영을 바꿔보며 투표 결과를 확인해보세요.';
    }
    if (practicePhase === 'defense') {
      return '반론 턴입니다.\n상대 주장에 대한 반박을 작성하고 \n 투표까지 진행해보세요.';
    }
    return '이제 실전처럼 한 라운드를 진행해볼게요.\n안내에 따라 차례대로 수행해보세요.';
  }, [introOverride, practicePhase]);

  const updatePhase = useCallback(
    (phase: BattlePhase) => {
      const now = Date.now();
      const expiresInMs = 3 * 60 * 1000;
      useBattleStore.getState().updateBattleProgress({
        phase,
        phaseCount: phase === 'ATTACK' || phase === 'DEFENSE' ? 1 : (battleProgress?.phaseCount ?? 1),
        startedAt: now,
        expiredAt: now + expiresInMs
      });
      useBattleStore.getState().setCurrentStage(phase);
    },
    [battleProgress?.phaseCount]
  );

  useEffect(() => {
    if (currentStep !== 'completed') return;
    if (practicePhase !== 'idle') return;

    setAttackSubmitted(false);
    setAttackVoted(false);
    setDefenseSubmitted(false);
    setDefenseVoted(false);
    setTeamSwitched(false);
    setTeamSwitchModalOpened(false);
    setDefenseEffectShown(false);
    phaseCycleRef.current = 1;
    setIntroOverride(null);
    setPracticePhase('attack');
    if (useBattleStore.getState().selectedTeam === 'NONE') {
      useBattleStore.getState().setSelectedTeam('A');
    }
    updatePhase('ATTACK');
  }, [currentStep, practicePhase, updatePhase]);

  useEffect(() => {
    if (practicePhase === 'attack' && attackSubmitted && attackVoted) {
      setPracticePhase('defense');
      updatePhase('DEFENSE');
    }
  }, [practicePhase, attackSubmitted, attackVoted, updatePhase]);

  useEffect(() => {
    if (practicePhase === 'defense' && defenseSubmitted && defenseVoted) {
      if (phaseCycleRef.current === 1) {
        phaseCycleRef.current = 2;
        setIntroOverride('한 번 더 반복됩니다.\n다시 공격 턴으로 돌아갈게요.');
        setDefenseSubmitted(false);
        setDefenseVoted(false);
        setAttackSubmitted(false);
        setAttackVoted(false);
        setPracticePhase('attack');
        updatePhase('ATTACK');
      } else {
        setPracticePhase('teamSwitch');
        updatePhase('TEAM_SWITCH');
      }
    }
  }, [practicePhase, defenseSubmitted, defenseVoted, updatePhase]);

  useEffect(() => {
    if (practicePhase === 'teamSwitch' && teamSwitched) {
      setPracticePhase('done');
    }
  }, [practicePhase, teamSwitched]);

  useEffect(() => {
    if (practicePhase === 'attack') {
      useBattleStore.getState().setDiscussions(ATTACK_DISCUSSIONS);
      setAttackSubmitted(false);
      setAttackVoted(false);
    }
    if (practicePhase === 'defense') {
      useBattleStore.getState().setDiscussions(DEFENSE_DISCUSSIONS);
      setDefenseSubmitted(false);
      setDefenseVoted(false);
      setDefenseEffectShown(false);
    }
  }, [practicePhase]);

  useEffect(() => {
    if (!practiceIntroVisible) return;
    if (typingIndex >= typingMessage.length) {
      const finishTimer = setTimeout(() => {
        setPracticeIntroVisible(false);
        setIntroOverride(null);
      }, 1200);
      return () => clearTimeout(finishTimer);
    }

    const timer = setTimeout(() => {
      setTypingIndex((prev) => prev + 1);
    }, 55);

    return () => clearTimeout(timer);
  }, [practiceIntroVisible, typingIndex, typingMessage]);

  useEffect(() => {
    if (practicePhase === 'idle') return;
    const updateOffset = () => {
      const card = practiceCardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const padding = 24;
      const offsetX = window.innerWidth / 2 - padding - rect.width / 2;
      const offsetY = window.innerHeight / 2 - padding - rect.height / 2;
      setCornerOffset({ x: offsetX, y: offsetY });
    };

    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, [practicePhase]);

  useEffect(() => {
    if (practicePhase === 'attack' || practicePhase === 'defense' || practicePhase === 'teamSwitch') {
      setPracticeIntroVisible(true);
      setTypingIndex(0);
    }
  }, [practicePhase]);

  useEffect(() => {
    if (practicePhase !== 'defense') return;
    if (practiceIntroVisible) return;
    if (defenseEffectShown) return;

    const timer = setTimeout(() => {
      const team = useBattleStore.getState().selectedTeam;
      if (team === 'NONE') return;
      const opponentTeam = team === 'A' ? 'B' : 'A';
      const cycleIndex = phaseCycleRef.current === 1 ? 0 : 1;
      const opponentMessages = TUTORIAL_ATTACK_MESSAGES[opponentTeam];
      const opponentMessage =
        opponentMessages?.[cycleIndex] ??
        opponentMessages?.[0] ??
        '상대 팀의 공격이 도착했습니다. 반론으로 반격해보세요!';

      setEffectModal({
        isOpen: true,
        team: opponentTeam,
        content: opponentMessage,
        type: 'attack'
      });
      setDefenseEffectShown(true);

      const noticeChat = {
        battleId: TUTORIAL_BATTLE_ID,
        scope: 'ALL' as const,
        messageId: `notice-attack-${Date.now()}`,
        sender: {
          userId: 'system',
          nickname: 'SYSTEM'
        },
        team: opponentTeam as 'A' | 'B',
        text: opponentMessage,
        createdAt: new Date(),
        type: 'attack' as const,
        votes: 0
      } as const;
      useBattleStore.getState().setOpponentNoticePending(noticeChat);
      useBattleStore.getState().commitOpponentNotice();
    }, 600);

    return () => clearTimeout(timer);
  }, [practicePhase, practiceIntroVisible, defenseEffectShown]);

  useEffect(() => {
    if (practicePhase !== 'teamSwitch') return;
    if (practiceIntroVisible) return;
    if (teamSwitchModalOpened) return;
    const timer = setTimeout(() => {
      onOpenTeamChangeModal();
      setTeamSwitchModalOpened(true);
    }, 350);
    return () => clearTimeout(timer);
  }, [practicePhase, practiceIntroVisible, teamSwitchModalOpened, onOpenTeamChangeModal]);

  const handleVote = useCallback(
    (discussionId: number) => {
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) return;

      const state = useBattleStore.getState();
      const target = state.discussions.find((discussion) => discussion.id === discussionId);
      if (!target || target.hasVoted) return;

      state.updateDiscussionVote(String(discussionId), target.votes + 1, [currentUser.id], currentUser.id);
      soundManager.play('click2');
      if (practicePhase === 'attack') setAttackVoted(true);
      if (practicePhase === 'defense') setDefenseVoted(true);
    },
    [practicePhase]
  );

  const handleDiscussionSubmit = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      const currentUser = useAuthStore.getState().user;
      const team = useBattleStore.getState().selectedTeam;
      console.log('Submitting discussion:', { trimmed, currentUser, team });
      if (!trimmed || team === 'NONE') return;

      const state = useBattleStore.getState();
      const totalVotes = state.discussions.reduce((sum, discussion) => sum + discussion.votes, 0);

      state.addDiscussion({
        id: Date.now(),
        user: currentUser?.nickname ? currentUser.nickname : 'You',
        team: team as 'A' | 'B',
        content: trimmed,
        votes: 0,
        totalVotes,
        hasVoted: false
      });
      if (practicePhase === 'attack') setAttackSubmitted(true);
      if (practicePhase === 'defense') setDefenseSubmitted(true);
    },
    [practicePhase]
  );

  const handleTeamSelect = useCallback((team: 'A' | 'B' | 'NONE') => {
    useBattleStore.getState().setSelectedTeam(team);
    setTeamSwitched(true);
  }, []);

  const closeEffectModal = useCallback(() => {
    setEffectModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    practicePhase,
    practiceIntroVisible,
    typingIndex,
    typingMessage,
    practiceCardRef,
    cornerOffset,
    showMissionFocus,
    attackSubmitted,
    attackVoted,
    defenseSubmitted,
    defenseVoted,
    needsAttackSubmit,
    needsAttackVote,
    needsDefenseSubmit,
    needsDefenseVote,
    needsTeamSwitch,
    effectModal,
    closeEffectModal,
    handleVote,
    handleDiscussionSubmit,
    handleTeamSelect,
    teamSwitchModalClassName: needsTeamSwitch
      ? 'ring-2 ring-orange-400/70 shadow-[0_0_30px_rgba(255,105,0,0.4)]'
      : undefined,
    shouldHighlightVote: needsAttackVote || needsDefenseVote,
    shouldHighlightInput: needsAttackSubmit || needsDefenseSubmit
  };
}
