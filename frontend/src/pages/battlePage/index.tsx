import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLoaderData } from 'react-router-dom';
import type { BattleInfo } from '@/commons/types/battle';
import { useBattle } from './hooks/useBattle';
import { useTeamVoteResult } from './hooks/useTeamVoteResult';
import { useTutorial } from './hooks/useTutorial';
import useModal from '@/commons/hooks/useModal';
import { soundManager } from '@/commons/utils/soundManager';
import { useBattleStore, selectBattleProgress, selectSelectedTeam } from './stores/battleStore';
import { isInputDisabled } from './utils/battlePhase';

import BattleHeader from './components/header';
import CodeSection from './components/codeview/CodeSection';
import ChatSection from './components/chatting/ChatSection';
import DiscussionInput from './components/discussion/DiscussionInput';
import DiscussionVote from './components/discussion/DiscussionVote';
import BattleSidebar from './components/sidebar';
import BookmarkButton from './components/sidebar/BookmarkButton';
import TutorialModal from './components/tutorial/TutorialModal';
import TutorialStepModal from './components/tutorial/TutorialStepModal';
import TeamChangeModal from './components/modals/TeamChangeModal';
import DiscussionModal from './components/effects/DiscussionModal';
import BattleProgressBoard from './components/progressBoard/ProgressBoard';
import TeamVoteResultModal from './components/effects/TeamVoteResultModal';
import RoundUpdateModal from './components/effects/RoundUpdateModal';
import SoundSettingsButton from './components/header/SoundSettingsButton';
import SkipModal from './components/effects/SkipModal';
import { selectUser, useAuthStore } from '@/commons/stores/authStore';

type Tab = 'info' | 'timeline';

export default function BattlePage() {
  const { id: battleId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const battleInfo = useLoaderData<BattleInfo>();
  const [viewMode, setViewMode] = useState<'split' | 'tab'>('split');
  const { isOpen: isSidebarOpen, openModal: handleOpenSidebar, closeModal: handleCloseSidebar } = useModal(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<Tab>('info');
  const sidebarOpenedForTutorial = useRef(false);
  const user = useAuthStore(selectUser);
  const leaveBattle = useBattleStore((s) => s.leaveBattle);
  const battleProgress = useBattleStore(selectBattleProgress);
  const hasLeftRef = useRef(false);

  const BGM_OPTIONS = [
    { key: 'lofi', label: 'LoFi', src: '/sounds/lofi.mp3' },
    { key: 'chill', label: 'Chill', src: '/sounds/chill.mp3' },
    { key: 'groove', label: 'Groove', src: '/sounds/groove.mp3' },
    { key: 'hiphop', label: 'Hip Hop', src: '/sounds/hiphop.mp3' },
    { key: 'jazz', label: 'Jazz', src: '/sounds/jazz.mp3' },
    { key: 'rock', label: 'Rock', src: '/sounds/rock.mp3' },
    { key: 'romantic', label: 'Romantic', src: '/sounds/romantic.mp3' }
  ];

  const safeLeaveBattle = useCallback(() => {
    if (hasLeftRef.current) return;
    hasLeftRef.current = true;
    leaveBattle();
  }, [leaveBattle]);

  useEffect(() => {
    if (!user) {
      alert('잘못된 진입입니다.');
      navigate(`/battle/${battleId}/team-select`, { replace: true });
    }
  }, [user, navigate, battleId]);

  useEffect(() => {
    const handlePageHide = () => {
      soundManager.stopAllBGM();
      safeLeaveBattle();
    };

    const handleBeforeUnload = () => {
      soundManager.stopAllBGM();
      safeLeaveBattle();
    };

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      soundManager.stopAllBGM();
      safeLeaveBattle();
    };
  }, [safeLeaveBattle]);

  // 튜토리얼 관리
  const {
    isModalOpen: isTutorialOpen,
    currentStep,
    dontShowAgain,
    skipTutorial,
    startTutorial,
    nextStep,
    prevStep,
    setDontShowAgain,
    closeTutorial
  } = useTutorial();

  // 사운드 초기화
  useEffect(() => {
    soundManager.preload('timerWarning', '/sounds/timerSound.wav');
    soundManager.preload('notificationPing', '/sounds/notificationPing.mp3');
    soundManager.preload('swoosh', '/sounds/swoosh.mp3');
    soundManager.preload('swordSlash', '/sounds/swordSlash.mp3');
    soundManager.preload('fanfare', '/sounds/fanfare.mp3');
    soundManager.preload('click', '/sounds/click.mp3');
    soundManager.preload('click2', '/sounds/click2.mp3');

    BGM_OPTIONS.forEach((bgm) => {
      soundManager.preloadBGM(bgm.key, bgm.src);
    });
  }, []);

  // 배틀 페이지 진입 시 BGM 자동 재생
  useEffect(() => {
    if (!soundManager.getCurrentBGM()) {
      soundManager.playBGM(BGM_OPTIONS[0].key);
    }
  }, []);

  useEffect(() => {
    const shouldOpenSidebar = isTutorialOpen && currentStep === 'sidebarPanel';

    if (shouldOpenSidebar && !isSidebarOpen) {
      setActiveSidebarTab('info');
      handleOpenSidebar();
      sidebarOpenedForTutorial.current = true;
      return;
    }

    if (!shouldOpenSidebar && sidebarOpenedForTutorial.current) {
      handleCloseSidebar();
      sidebarOpenedForTutorial.current = false;
    }
  }, [currentStep, isSidebarOpen, isTutorialOpen, handleCloseSidebar, handleOpenSidebar]);

  const {
    isOpen: isTeamChangeModalOpen,
    openModal: handleOpenTeamChangeModal,
    closeModal: handleCloseTeamChangeModal
  } = useModal(false);

  const { handleVote, handleDiscussionSubmit, effectModal, hideEffect, hideRoundEffect, roundModal, handleTeamChange } =
    useBattle({
      battleId,
      onOpenTeamChangeModal: handleOpenTeamChangeModal,
      onCloseTeamChangeModal: handleCloseTeamChangeModal
    });

  const { voteResult, isModalOpen: isVoteResultModalOpen, closeModal: closeVoteResultModal } = useTeamVoteResult();

  // Phase와 Team 정보 가져오기
  const team = useBattleStore(selectSelectedTeam);
  const phase = battleProgress?.phase;
  const shouldShowInput = !isInputDisabled(team, phase);

  const handleLeaveBattle = () => {
    if (!user) return;
    // TODO 추후에 서버에서 Disconnect 관리
    navigate('/');
    safeLeaveBattle();
  };

  return (
    <div className="text-white relative">
      {/* 책갈피 버튼 */}
      <BookmarkButton
        onOpen={(tab) => {
          setActiveSidebarTab(tab);
          handleOpenSidebar();
        }}
        isOpen={isSidebarOpen}
        highlight={isTutorialOpen && currentStep === 'sidebar'}
      />

      {/* 사이드바 */}
      <BattleSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={battleInfo.title}
        description={battleInfo.description}
        language={battleInfo.language}
        category={battleInfo.category}
        topics={battleInfo.topics}
        raiseZIndex={isTutorialOpen && currentStep === 'sidebarPanel'}
        activeTab={activeSidebarTab}
        onActiveTabChange={setActiveSidebarTab}
      />

      {/* 메인 콘텐츠 */}
      <div className="flex flex-col items-center">
        <BattleProgressBoard />
        <div
          className={`transition-all duration-300 main-width-closed ${
            battleProgress &&
            (battleProgress.phase as string) !== 'PENDING' &&
            battleProgress.expiredAt != null &&
            battleProgress.startedAt
          }`}
        >
          <div className="flex items-center justify-between mt-10 mb-8">
            <button
              onClick={handleLeaveBattle}
              className="px-4 py-2 rounded-lg bg-[#2D2D3F] hover:bg-[#3D3D4F] text-white transition-colors"
            >
              ← 돌아가기
            </button>
          </div>
          <SoundSettingsButton bgmOptions={BGM_OPTIONS} />
          <BattleHeader />
        </div>
        <main className="main-width-closed">
          <div className="flex gap-2 py-4">
            <div className="flex-1 min-w-0">
              <CodeSection
                onViewChange={setViewMode}
                currentView={viewMode}
                language={battleInfo.language}
                codeA={battleInfo.aCode}
                codeB={battleInfo.bCode}
              />
            </div>
            <aside
              className={`flex flex-col gap-4 transition-all duration-300 ${isSidebarOpen ? 'lounge-width-open' : 'lounge-width-closed'}`}
            >
              <DiscussionVote onVote={handleVote} />
              <ChatSection />
            </aside>
          </div>
        </main>
        {/* DiscussionInput - 화면 중앙 하단에 fixed */}
        <div
          className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 z-5 px-4 pb-4 transition-all duration-500 ease-out ${
            shouldShowInput ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
          }`}
        >
          <div className="discussion-input-width">
            {shouldShowInput && <DiscussionInput key={phase} onSubmit={handleDiscussionSubmit} />}
          </div>
        </div>
        {isTeamChangeModalOpen && (
          <TeamChangeModal
            topics={battleInfo.topics}
            handleTeamChange={handleTeamChange}
            onClose={handleCloseTeamChangeModal}
          />
        )}
        {effectModal.isOpen && effectModal.team !== 'NONE' && (
          <DiscussionModal
            isOpen={effectModal.isOpen}
            team={effectModal.team}
            content={effectModal.content}
            type={effectModal.type}
            onClose={hideEffect}
          />
        )}
        {isVoteResultModalOpen && voteResult && (
          <TeamVoteResultModal
            isOpen={isVoteResultModalOpen}
            round={voteResult.round}
            teamACount={voteResult.after.teamA}
            teamBCount={voteResult.after.teamB}
            teamABefore={voteResult.before.teamA}
            teamBBefore={voteResult.before.teamB}
            teamAPercentage={(voteResult.after.teamA / (voteResult.after.teamA + voteResult.after.teamB)) * 100}
            teamBPercentage={(voteResult.after.teamB / (voteResult.after.teamA + voteResult.after.teamB)) * 100}
            leadingTeam={voteResult.dominantTeam === 'NONE' ? null : voteResult.dominantTeam}
            onClose={closeVoteResultModal}
          />
        )}
        {roundModal.isPending && !isVoteResultModalOpen && (
          <RoundUpdateModal isOpen={true} round={roundModal.round} topic={roundModal.topic} onClose={hideRoundEffect} />
        )}

        <SkipModal isOpen={true} onClose={hideRoundEffect} />

        <TutorialModal
          isOpen={isTutorialOpen && currentStep === 'welcome'}
          onClose={skipTutorial}
          onStart={startTutorial}
          dontShowAgain={dontShowAgain}
          onDontShowAgainChange={setDontShowAgain}
        />
        <TutorialStepModal
          isOpen={isTutorialOpen && currentStep !== 'welcome' && currentStep !== 'completed'}
          currentStep={currentStep}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTutorial}
          onClose={closeTutorial}
        />
      </div>
    </div>
  );
}
