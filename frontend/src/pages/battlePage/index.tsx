import { useState, useEffect } from 'react';
import { useParams, useLoaderData } from 'react-router-dom';
import type { BattleInfo } from '@/commons/types/battle';
import { useBattle } from './hooks/useBattle';
import { useTeamVoteResult } from './hooks/useTeamVoteResult';
import { useTutorial } from './hooks/useTutorial';
import useModal from '@/commons/hooks/useModal';
import { soundManager } from '@/commons/utils/soundManager';

import BattleHeader from './components/header';
import CodeSection from './components/codeview/CodeSection';
import ChatSection from './components/chatting/ChatSection';
import DiscussionInput from './components/discussion/DiscussionInput';
import DiscussionVote from './components/discussion/DiscussionVote';
import BattleSidebar from './components/sidebar/BattleSidebar';
import BookmarkButton from './components/sidebar/BookmarkButton';
import TutorialModal from './components/tutorial/TutorialModal';
import TutorialStepModal from './components/tutorial/TutorialStepModal';
import TeamChangeModal from './components/modals/TeamChangeModal';
import DiscussionModal from './components/effects/DiscussionModal';
import BattleProgressBoard from './components/progressBoard/ProgressBoard';
import TeamVoteResultModal from './components/effects/TeamVoteResultModal';

export default function BattlePage() {
  const { id: battleId } = useParams<{ id: string }>();
  const battleInfo = useLoaderData<BattleInfo>();
  const [viewMode, setViewMode] = useState<'split' | 'tab'>('split');
  const { isOpen: isSidebarOpen, openModal: handleOpenSidebar, closeModal: handleCloseSidebar } = useModal(false);

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
  }, []);

  const {
    isOpen: isTeamChangeModalOpen,
    openModal: handleOpenTeamChangeModal,
    closeModal: handleCloseTeamChangeModal
  } = useModal(false);

  const { handleVote, handleDiscussionSubmit, effectModal, hideEffect, handleTeamChange } = useBattle({
    battleId,
    onOpenTeamChangeModal: handleOpenTeamChangeModal,
    onCloseTeamChangeModal: handleCloseTeamChangeModal
  });

  const { voteResult, isModalOpen: isVoteResultModalOpen, closeModal: closeVoteResultModal } = useTeamVoteResult();

  return (
    <div className="text-white relative min-h-screen">
      {/* 책갈피 버튼 */}
      <BookmarkButton onOpen={handleOpenSidebar} isOpen={isSidebarOpen} />

      {/* 사이드바 */}
      <BattleSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={battleInfo.title}
        description={battleInfo.description}
        language={battleInfo.language}
        category={battleInfo.category}
      />

      {/* 메인 콘텐츠 */}
      <div
        className={`flex flex-col items-center transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-sidebar' : 'ml-0'
        }`}
      >
        <div className={`transition-all duration-300 ${isSidebarOpen ? 'main-width-open' : 'main-width-closed'}`}>
          <div className="-mb-[10px]">
            <BattleProgressBoard />
          </div>
          <BattleHeader />
        </div>
        <main className={`transition-all duration-300 ${isSidebarOpen ? 'main-width-open' : 'main-width-closed'}`}>
          <div className="flex gap-2 py-4">
            <div className="flex-1">
              <CodeSection
                onViewChange={setViewMode}
                currentView={viewMode}
                language={battleInfo.language}
                codeA={battleInfo.aCode}
                codeB={battleInfo.bCode}
              />
            </div>
            <aside className="flex flex-col gap-4 w-[590px]">
              <DiscussionVote onVote={handleVote} />
              <ChatSection />
            </aside>
          </div>
        </main>

        {/* DiscussionInput  */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[1800px] px-4 pb-4 z-50">
          <div className="max-w-[590px] mx-auto">
            <DiscussionInput onSubmit={handleDiscussionSubmit} />
          </div>
        </div>

        {isTeamChangeModalOpen && (
          <TeamChangeModal handleTeamChange={handleTeamChange} onClose={handleCloseTeamChangeModal} />
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
