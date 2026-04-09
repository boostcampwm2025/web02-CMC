import { useState, useCallback } from 'react';
import Button from '@/commons/components/Button';
import { useLocation, useNavigate, useLoaderData } from 'react-router-dom';
import type { BattleInfo, Team } from '@/commons/types/battle';
import useModal from '@/commons/hooks/useModal';
import { useBattleStore, selectBattleProgress, selectSelectedTeam } from '@/pages/battlePage/stores/battleStore';
import { isInputDisabled } from '@/pages/battlePage/utils/battlePhase';

import BattleHeader from '@/pages/battlePage/components/header';
import CodeSection from '@/pages/battlePage/components/codeview/CodeSection';
import ChatSection from '@/pages/battlePage/components/chatting/ChatSection';
import DiscussionInput from '@/pages/battlePage/components/discussion/DiscussionInput';
import DiscussionVote from '@/pages/battlePage/components/discussion/DiscussionVote';
import BattleSidebar from '@/pages/battlePage/components/sidebar';
import SidebarTrigger from '@/pages/battlePage/components/sidebar/SidebarTrigger';
import TutorialModal from '@/pages/tutorialPage/components/TutorialModal';
import TutorialStepModal from '@/pages/tutorialPage/components/TutorialStepModal';
import BattleProgressBoard from '@/pages/battlePage/components/progressBoard/ProgressBoard';
import TeamChangeModal from '@/pages/battlePage/components/modals/TeamChangeModal';
import TeamVoteResultModal from '@/pages/battlePage/components/effects/TeamVoteResultModal';
import DiscussionModal from '@/pages/battlePage/components/effects/DiscussionModal';
import { useTeamVoteResult } from '@/pages/battlePage/hooks/useTeamVoteResult';
import { useTutorialBattleSetup } from './hooks/useTutorialBattleSetup';
import { usePracticeFlow } from './hooks/usePracticeFlow';
import { useTutorialUI } from './hooks/useTutorialUI';
import { useTutorialSounds } from './hooks/useTutorialSounds';
import { useAutoExitOnDone } from './hooks/useAutoExitOnDone';
import PracticeGuideCard from './components/PracticeGuideCard';

export default function TutorialBattlePage() {
  const battleInfo = useLoaderData<BattleInfo>();
  const location = useLocation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'split' | 'tab'>('split');
  const { isOpen: isSidebarOpen, openModal: handleOpenSidebar, closeModal: handleCloseSidebar } = useModal(false);
  const {
    isOpen: isTeamChangeModalOpen,
    openModal: handleOpenTeamChangeModal,
    closeModal: handleCloseTeamChangeModal
  } = useModal(false);
  const battleProgress = useBattleStore(selectBattleProgress);
  const selectedTeam = useBattleStore(selectSelectedTeam);

  const selectedTeamFromState = (location.state as { selectedTeam?: Team })?.selectedTeam;

  useTutorialBattleSetup({ battleInfo, selectedTeamFromState });

  const {
    isTutorialOpen,
    currentStep,
    dontShowAgain,
    startTutorial,
    nextStep,
    prevStep,
    setDontShowAgain,
    activeSidebarTab,
    setActiveSidebarTab
  } = useTutorialUI({
    isSidebarOpen,
    openSidebar: handleOpenSidebar,
    closeSidebar: handleCloseSidebar
  });

  useTutorialSounds();

  const {
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
    teamSwitchModalClassName,
    shouldHighlightVote,
    shouldHighlightInput
  } = usePracticeFlow({
    currentStep,
    onOpenTeamChangeModal: handleOpenTeamChangeModal
  });

  const { voteResult, isModalOpen: isVoteResultModalOpen, closeModal: closeVoteResultModal } = useTeamVoteResult();

  const handleLeaveBattle = () => {
    navigate('/main');
  };

  const phase = battleProgress?.phase;
  const shouldShowInput = !isInputDisabled(selectedTeam, phase);

  const handleAutoExit = useCallback(() => {
    navigate('/main');
  }, [navigate]);

  useAutoExitOnDone(practicePhase === 'done', handleAutoExit);

  return (
    <div className="text-white relative">
      <SidebarTrigger
        onOpen={(tab) => {
          setActiveSidebarTab(tab);
          handleOpenSidebar();
        }}
        isOpen={isSidebarOpen}
        highlight={isTutorialOpen && currentStep === 'sidebar'}
      />

      <BattleSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        raiseZIndex={isTutorialOpen && currentStep === 'sidebarPanel'}
        activeTab={activeSidebarTab}
        onActiveTabChange={setActiveSidebarTab}
      />

      <div className="flex flex-col items-center">
        <PracticeGuideCard
          isVisible={practicePhase !== 'idle'}
          practiceIntroVisible={practiceIntroVisible}
          typingMessage={typingMessage}
          typingIndex={typingIndex}
          practicePhase={practicePhase}
          showMissionFocus={showMissionFocus}
          attackSubmitted={attackSubmitted}
          attackVoted={attackVoted}
          defenseSubmitted={defenseSubmitted}
          defenseVoted={defenseVoted}
          needsAttackSubmit={needsAttackSubmit}
          needsAttackVote={needsAttackVote}
          needsDefenseSubmit={needsDefenseSubmit}
          needsDefenseVote={needsDefenseVote}
          needsTeamSwitch={needsTeamSwitch}
          practiceCardRef={practiceCardRef}
          cornerOffset={cornerOffset}
        />

        <BattleProgressBoard />
        <div className="transition-all duration-300 main-width-closed">
          <div className="flex items-center justify-between mt-10 mb-8">
            <Button variant="secondary" size="sm" onClick={handleLeaveBattle}>
              ← 돌아가기
            </Button>
          </div>
          <BattleHeader isSkipEnabled={false} toggleSkip={() => {}} totalSkips={0} />
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
              className={`flex flex-col gap-4 transition-all duration-300 ${
                isSidebarOpen ? 'lounge-width-open' : 'lounge-width-closed'
              }`}
            >
              <div
                data-tutorial="vote"
                className={
                  shouldHighlightVote
                    ? 'rounded-lg ring-2 ring-orange-400/70 shadow-[0_0_25px_rgba(255,105,0,0.35)] animate-pulse'
                    : undefined
                }
              >
                <DiscussionVote onVote={handleVote} />
              </div>
              <ChatSection />
            </aside>
          </div>
        </main>

        <div
          className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 z-[5] px-4 pb-4 transition-all duration-500 ease-out ${
            shouldShowInput ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
          }`}
        >
          <div className="discussion-input-width">
            {shouldShowInput && (
              <div
                className={
                  shouldHighlightInput
                    ? 'rounded-2xl ring-2 ring-orange-400/70 shadow-[0_0_25px_rgba(255,105,0,0.35)] animate-pulse'
                    : undefined
                }
              >
                <DiscussionInput key={phase} onSubmit={handleDiscussionSubmit} />
              </div>
            )}
          </div>
        </div>

        <TeamChangeModal
          isOpen={isTeamChangeModalOpen}
          topics={battleInfo.topics}
          handleTeamChange={handleTeamSelect}
          onClose={handleCloseTeamChangeModal}
          className={teamSwitchModalClassName}
        />

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

        <DiscussionModal
          isOpen={effectModal.isOpen}
          team={effectModal.team}
          content={effectModal.content}
          type={effectModal.type}
          onClose={closeEffectModal}
        />

        <TutorialModal
          isOpen={isTutorialOpen && currentStep === 'welcome'}
          onStart={startTutorial}
          dontShowAgain={dontShowAgain}
          onDontShowAgainChange={setDontShowAgain}
        />

        <TutorialStepModal
          isOpen={isTutorialOpen && currentStep !== 'welcome' && currentStep !== 'completed'}
          currentStep={currentStep}
          onNext={nextStep}
          onPrev={prevStep}
        />
      </div>
    </div>
  );
}
