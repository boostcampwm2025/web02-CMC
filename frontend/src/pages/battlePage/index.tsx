import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBattle } from './hooks/useBattle';
import useModal from '@/commons/hooks/useModal';
import useBattleSound from './hooks/useBattleSound';
import { useBattleLeave } from './hooks/useBattleLeave';

import BattleTopBar from './components/header/BattleTopBar';
import BattleMainContent from './components/BattleMainContent';
import BattleSidebar from './components/sidebar';
import SidebarTrigger from './components/sidebar/SidebarTrigger';
import BattleModals from './components/modals/BattleModals';
import BattleProgressBoard from './components/progressBoard/ProgressBoard';
import type { SidebarTab } from './components/sidebar/SidebarHeader';

export default function BattlePage() {
  const { id: battleId } = useParams<{ id: string }>();
  const [viewMode, setViewMode] = useState<'split' | 'tab'>('split');
  const { isOpen: isSidebarOpen, openModal: handleOpenSidebar, closeModal: handleCloseSidebar } = useModal(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('info');

  const { bgmOptions } = useBattleSound();
  const { handleLeaveBattle } = useBattleLeave();

  const {
    handleVote,
    handleDiscussionSubmit,
    effectModal,
    hideEffect,
    hideRoundEffect,
    roundModal,
    handleTeamChange,
    isTeamChangeModalOpen,
    closeTeamChangeModal
  } = useBattle({ battleId });

  return (
    <div className="text-white relative">
      <SidebarTrigger
        onOpen={(tab) => {
          setActiveSidebarTab(tab);
          handleOpenSidebar();
        }}
        isOpen={isSidebarOpen}
      />

      <BattleSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        activeTab={activeSidebarTab}
        onActiveTabChange={setActiveSidebarTab}
      />

      <div className="flex flex-col items-center">
        <BattleProgressBoard />
        <BattleTopBar onLeave={handleLeaveBattle} bgmOptions={bgmOptions} />
        <BattleMainContent
          viewMode={viewMode}
          onViewChange={setViewMode}
          isSidebarOpen={isSidebarOpen}
          onVote={handleVote}
          onDiscussionSubmit={handleDiscussionSubmit}
        />
        <BattleModals
          effectModal={effectModal}
          onHideEffect={hideEffect}
          roundModal={roundModal}
          onHideRoundEffect={hideRoundEffect}
          handleTeamChange={handleTeamChange}
          isTeamChangeModalOpen={isTeamChangeModalOpen}
          onCloseTeamChangeModal={closeTeamChangeModal}
        />
      </div>
    </div>
  );
}
