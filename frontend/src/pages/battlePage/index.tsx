import { useState } from 'react';
import { useParams, useLoaderData } from 'react-router-dom';
import type { BattleInfo } from '@/commons/types/battle';
import BattleHeader from './components/header/BattleHeader';
import CodeSection from './components/codeview/CodeSection';
import ChatSection from './components/chatting/ChatSection';
import DiscussionInput from './components/discussion/DiscussionInput';
import DiscussionVote from './components/discussion/DiscussionVote';
import BattleSidebar from './components/sidebar/BattleSidebar';
import BookmarkButton from './components/sidebar/BookmarkButton';
import { useBattle } from './hooks/useBattle';
import useModal from '@/commons/hooks/useModal';
import TeamChangeModal from './components/modals/TeamChangeModal';
import DiscussionModal from './components/effects/DiscussionModal';

export default function BattlePage() {
  const { id: battleId } = useParams<{ id: string }>();
  const battleInfo = useLoaderData<BattleInfo>();
  const [viewMode, setViewMode] = useState<'split' | 'tab'>('split');
  const { isOpen: isSidebarOpen, openModal: handleOpenSidebar, closeModal: handleCloseSidebar } = useModal(false);

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
          <BattleHeader />
        </div>
        <main className={`transition-all duration-300 ${isSidebarOpen ? 'main-width-open' : 'main-width-closed'}`}>
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
              <ChatSection />
              <DiscussionInput onSubmit={handleDiscussionSubmit} />
              <DiscussionVote onVote={handleVote} />
            </aside>
          </div>
        </main>

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
