import { useState, useEffect } from 'react';
import { useParams, useLoaderData } from 'react-router-dom';
import type { BattleInfo } from '@/commons/types/battle';
import BattleHeader from './components/header';
import CodeSection from './components/codeview/CodeSection';
import ChatSection from './components/chatting/ChatSection';
import DiscussionInput from './components/discussion/DiscussionInput';
import DiscussionVote from './components/discussion/DiscussionVote';
import BattleSidebar from './components/sidebar/BattleSidebar';
import BookmarkButton from './components/sidebar/BookmarkButton';
import { useBattle } from './hooks/useBattle';
import { useTeamVoteResult } from './hooks/useTeamVoteResult';
import useModal from '@/commons/hooks/useModal';
import TeamChangeModal from './components/modals/TeamChangeModal';
import DiscussionModal from './components/effects/DiscussionModal';
import BattleProgressBoard from './components/progressBoard/ProgressBoard';
import { soundManager } from '@/commons/utils/soundManager';

export default function BattlePage() {
  const { id: battleId } = useParams<{ id: string }>();
  const battleInfo = useLoaderData<BattleInfo>();
  const [viewMode, setViewMode] = useState<'split' | 'tab'>('split');
  const { isOpen: isSidebarOpen, openModal: handleOpenSidebar, closeModal: handleCloseSidebar } = useModal(false);

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

  // TODO: 진영 투표 결과 모달 추가 시 주석 해제
  // const { voteResult, isModalOpen: isVoteResultModalOpen, closeModal: closeVoteResultModal } = useTeamVoteResult();
  useTeamVoteResult(); // 이벤트 구독만 활성화

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

        {/* DiscussionInput 항상 중앙 하단에 고정 */}
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
      </div>
    </div>
  );
}
