import { useState } from 'react';
import { useParams, useLoaderData } from 'react-router-dom';
import type { BattleInfo } from '@/commons/types/battle';
import BattleHeader from './components/header/BattleHeader';
import CodeSection from './components/codeview/CodeSection';
import ChatSection from './components/chatting/ChatSection';
import DiscussionInput from './components/discussion/DiscussionInput';
import DiscussionVote from './components/discussion/DiscussionVote';
import TimelineSection from './components/timeline/TimelineSection';
import { useBattle } from './hooks/useBattle';
import useModal from '@/commons/hooks/useModal';
import TeamChangeModal from './components/modals/TeamChangeModal';
import DiscussionModal from './components/effects/DiscussionModal';

export default function BattlePage() {
  const { id: battleId } = useParams<{ id: string }>();
  const battleInfo = useLoaderData<BattleInfo>();
  const [viewMode, setViewMode] = useState<'split' | 'tab'>('split');

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
    <div className="text-white flex flex-col items-center relative">
      <div className="w-[1800px]">
        <BattleHeader title={battleInfo.title} description={battleInfo.description} />
      </div>
      <main className="w-[1800px] pb-24">
        <div className="flex gap-2 py-4">
          <div className="flex-1">
            <CodeSection
              onViewChange={setViewMode}
              currentView={viewMode}
              language="javascript"
              codeA={battleInfo.aCode}
              codeB={battleInfo.bCode}
            />
            <TimelineSection />
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
  );
}
