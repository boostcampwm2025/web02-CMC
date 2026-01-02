import { useState, useEffect } from 'react';
import { useParams, useLoaderData } from 'react-router-dom';
import type { BattleInfo } from '@/commons/types/battle';
import BattleHeader from './components/header/BattleHeader';
import CodeSection from './components/codeview/CodeSection';
import ChatSection from './components/chatting/ChatSection';
import ObjectionInput from './components/objection/ObjectionInput';
import ObjectionVote from './components/objection/ObjectionVote';
import TimelineSection from './components/timeline/TimelineSection';
import { useBattleSocket } from './hooks/useBattleSocket';
import { useBattleProgress } from './hooks/useBattleProgress';
import { useBattleDiscussions } from './hooks/useBattleDiscussions';
import { useBattleTimeline } from './hooks/useBattleTimeline';
import { useBattleTeam } from './hooks/useBattleTeam';
import { useBattleStore } from './stores/battleStore';
import useModal from '@/commons/hooks/useModal';
import TeamChangeModal from './components/modals/TeamChangeModal';
import ObjectionModal from './components/effects/ObjectionModal';

export default function BattlePage() {
  const { id } = useParams<{ id: string }>();

  const battleInfo = useLoaderData<BattleInfo>();
  const [viewMode, setViewMode] = useState<'split' | 'tab'>('split');
  const {
    isOpen: isTeamChangeModalOpen,
    openModal: openTeamChangeModal,
    closeModal: closeTeamChangeModal
  } = useModal(false);

  // 각 탭/브라우저별 고유 userId 생성 및 store 초기화
  useEffect(() => {
    let userId = sessionStorage.getItem('testUserId');
    if (!userId) {
      userId = `user-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('testUserId', userId);
    }
    useBattleStore.getState().initializeBattle({
      userId,
      battleId: id || '1'
    });
  }, [id]);

  useBattleSocket();
  useBattleProgress();

  const { handleVote, handleObjectionSubmit } = useBattleDiscussions();
  const { effectModal, hideEffect } = useBattleTimeline();
  const { handleTeamChange } = useBattleTeam({
    onOpenTeamChangeModal: openTeamChangeModal,
    onCloseTeamChangeModal: closeTeamChangeModal
  });

  return (
    <div className="text-white flex flex-col items-center">
      <div className="w-[1800px]">
        <BattleHeader title={battleInfo.title} description={battleInfo.description} />
      </div>
      <main className="w-[1800px]">
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
            <ChatSection />
            <ObjectionInput onSubmit={handleObjectionSubmit} />
            <ObjectionVote onVote={handleVote} />
          </aside>
        </div>
      </main>

      {isTeamChangeModalOpen && <TeamChangeModal handleTeamChange={handleTeamChange} onClose={closeTeamChangeModal} />}

      {effectModal.isOpen && effectModal.team !== 'NONE' && (
        <ObjectionModal
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
