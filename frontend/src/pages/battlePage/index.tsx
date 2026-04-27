import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBattle } from './hooks/useBattle';
import useModal from '@/commons/hooks/useModal';
import useBattleSound from './hooks/useBattleSound';
import { useBattleLeave } from './hooks/useBattleLeave';

import BattleTopBar from '@/features/battle/components/header/BattleTopBar';
import BattleMainContent from './components/BattleMainContent';
import BattleSidebar from '@/features/battle/components/sidebar';
import SidebarTrigger from '@/features/battle/components/sidebar/SidebarTrigger';
import BattleModals from './components/modals/BattleModals';
import BattleProgressBoard from '@/features/battle/components/progressBoard/ProgressBoard';
import type { SidebarTab } from '@/features/battle/components/sidebar/SidebarHeader';

export default function BattlePage() {
  const { id: battleId } = useParams<{ id: string }>();
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
