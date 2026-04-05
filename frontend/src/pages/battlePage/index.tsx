import { useState } from 'react';
import Button from '@/commons/components/Button';
import { useParams } from 'react-router-dom';
import { useBattle } from './hooks/useBattle';
import { useTeamVoteResult } from './hooks/useTeamVoteResult';
import useModal from '@/commons/hooks/useModal';
import useBattleSound from './hooks/useBattleSound';
import { useBattleLeave } from './hooks/useBattleLeave';
import { useBattleStore, selectBattleProgress, selectSelectedTeam } from './stores/battleStore';
import { isInputDisabled } from './utils/battlePhase';
import { useGetBattleInfo } from '@/commons/hooks/useGetBattleInfo';

import BattleHeader from './components/header';
import CodeSection from './components/codeview/CodeSection';
import ChatSection from './components/chatting/ChatSection';
import DiscussionInput from './components/discussion/DiscussionInput';
import DiscussionVote from './components/discussion/DiscussionVote';
import BattleSidebar from './components/sidebar';
import BookmarkButton from './components/sidebar/BookmarkButton';
import TeamChangeModal from './components/modals/TeamChangeModal';
import ConnectionErrorModal from './components/modals/ConnectionErrorModal';
import DiscussionModal from './components/effects/DiscussionModal';
import BattleProgressBoard from './components/progressBoard/ProgressBoard';
import TeamVoteResultModal from './components/effects/TeamVoteResultModal';
import RoundUpdateModal from './components/effects/RoundUpdateModal';
import SoundSettingsButton from './components/header/SoundSettingsButton';
import SkipModal from './components/effects/SkipModal';
import { usePhaseSkip } from './hooks/usePhaseSkip';
import InviteLinkButton from '@/pages/battleCreatePage/components/InviteLinkButton';

type Tab = 'info' | 'timeline' | 'reference';

export default function BattlePage() {
  const { id: battleId } = useParams<{ id: string }>();
  const { battleInfo: battleInfoData } = useGetBattleInfo(battleId!);
  const [viewMode, setViewMode] = useState<'split' | 'tab'>('split');
  const { isOpen: isSidebarOpen, openModal: handleOpenSidebar, closeModal: handleCloseSidebar } = useModal(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<Tab>('info');
  const battleProgress = useBattleStore(selectBattleProgress);

  const { bgmOptions } = useBattleSound();
  const { handleLeaveBattle } = useBattleLeave();

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
  const {
    isModalOpen: isPhaseSkipModalOpen,
    closeModal: closeSkipModal,
    isSkipEnabled,
    toggleSkip,
    totalSkips
  } = usePhaseSkip();

  const team = useBattleStore(selectSelectedTeam);
  const phase = battleProgress?.phase;
  const shouldShowInput = !isInputDisabled(team, phase);

  const battleInfo = battleInfoData;

  return (
    <div className="text-white relative">
      {/* 책갈피 버튼 */}
      <BookmarkButton
        onOpen={(tab) => {
          setActiveSidebarTab(tab);
          handleOpenSidebar();
        }}
        isOpen={isSidebarOpen}
        hasReferenceData={!!battleInfo?.referenceData}
      />

      {/* 사이드바 */}
      <BattleSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={battleInfo?.title || ''}
        description={battleInfo?.description || ''}
        language={battleInfo?.language || 'javascript'}
        category={battleInfo?.category || 'ALGORITHM'}
        topics={battleInfo?.topics || []}
        referenceData={battleInfo?.referenceData}
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
          <div className="flex items-center justify-between gap-4 mt-10 mb-8">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLeaveBattle}
              className="shrink-0 w-[100px] sm:w-auto sm:min-w-[100px]"
            >
              ← 돌아가기
            </Button>
            <div className="shrink-0 flex items-center gap-2">
              {battleInfo?.inviteCode && <InviteLinkButton inviteCode={battleInfo.inviteCode} />}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <SoundSettingsButton bgmOptions={bgmOptions} />
            <BattleHeader isSkipEnabled={isSkipEnabled} toggleSkip={toggleSkip} totalSkips={totalSkips} />
          </div>
        </div>
        <main className="main-width-closed">
          <div className="flex gap-2 py-4">
            <div className="flex-1 min-w-0">
              <CodeSection
                onViewChange={setViewMode}
                currentView={viewMode}
                language={battleInfo?.language || 'javascript'}
                codeA={battleInfo?.aCode || ''}
                codeB={battleInfo?.bCode || ''}
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
        <div
          className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 z-5 px-4 pb-4 transition-all duration-500 ease-out ${
            shouldShowInput ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
          }`}
        >
          <div className="discussion-input-width">
            {shouldShowInput && <DiscussionInput key={phase} onSubmit={handleDiscussionSubmit} />}
          </div>
        </div>
        {battleInfo && (
          <TeamChangeModal
            isOpen={isTeamChangeModalOpen}
            topics={battleInfo.topics}
            handleTeamChange={handleTeamChange}
            onClose={handleCloseTeamChangeModal}
          />
        )}
        {!isPhaseSkipModalOpen && effectModal.isOpen && effectModal.team !== 'NONE' && (
          <DiscussionModal
            isOpen={effectModal.isOpen}
            team={effectModal.team}
            content={effectModal.content}
            type={effectModal.type}
            onClose={hideEffect}
          />
        )}
        {isPhaseSkipModalOpen && <SkipModal isOpen={true} onClose={closeSkipModal} />}
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
        <ConnectionErrorModal />
      </div>
    </div>
  );
}
