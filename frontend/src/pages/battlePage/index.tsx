import { useState } from 'react';
import { useParams, useLoaderData } from 'react-router-dom';
import type { BattleInfo } from '@/commons/types/battle';
import BattleHeader from './components/header/BattleHeader';
import CodeSection from './components/codeview/CodeSection';
import ChatSection from './components/chatting/ChatSection';
import ObjectionInput from './components/objection/ObjectionInput';
import ObjectionVote from './components/objection/ObjectionVote';
import TimelineSection from './components/timeline/TimelineSection';
import { useBattleSocket } from './hooks/useBattleSocket';
import { useBattleTimer } from './hooks/useBattleTimer';
import { useBattleProgress } from './hooks/useBattleProgress';
import { useBattleDiscussions } from './hooks/useBattleDiscussions';
import { useBattleTimeline } from './hooks/useBattleTimeline';
import { useBattleTeam } from './hooks/useBattleTeam';
import {
  useBattleStore,
  selectSocket,
  selectCurrentStage,
  selectBattleProgress,
  selectDiscussions,
  selectTeamCounts,
  selectTimelines,
  selectChats,
  selectSelectedTeam
} from './stores/battleStore';
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

  // 각 탭/브라우저별 고유 userId 생성 (테스트용)
  const [userId] = useState(() => {
    let id = sessionStorage.getItem('testUserId');
    if (!id) {
      id = `user-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('testUserId', id);
    }
    return id;
  });

  useBattleSocket({
    battleId: id || '1',
    userId,
    team: 'NONE' // 초기값
  });

  const socket = useBattleStore(selectSocket);
  const currentStage = useBattleStore(selectCurrentStage);
  const battleProgress = useBattleStore(selectBattleProgress);
  const objections = useBattleStore(selectDiscussions);
  const teamCounts = useBattleStore(selectTeamCounts);
  const timelines = useBattleStore(selectTimelines);
  const chats = useBattleStore(selectChats);
  const selectedTeam = useBattleStore(selectSelectedTeam);

  const { formattedTime } = useBattleTimer({
    expiredAt: battleProgress?.expiredAt
  });

  useBattleProgress({ socket });
  const { handleVote, handleObjectionSubmit } = useBattleDiscussions({
    socket,
    userId,
    team: selectedTeam,
    battleId: id || '1'
  });
  const { effectModal, hideEffect } = useBattleTimeline({ socket });
  const { handleTeamChange } = useBattleTeam({
    socket,
    battleId: id || '1',
    onOpenTeamChangeModal: openTeamChangeModal,
    onCloseTeamChangeModal: closeTeamChangeModal
  });

  return (
    <div className="text-white flex flex-col items-center">
      <div className="w-[1800px]">
        <BattleHeader
          title={battleInfo.title}
          description={battleInfo.description}
          status={currentStage || 'END'}
          timer={formattedTime}
          teamACounts={teamCounts?.teamA || 0}
          teamBCounts={teamCounts?.teamB || 0}
          teamNoneCounts={0}
        />
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
            <TimelineSection attackList={timelines?.attacks} defenseList={timelines?.defenses} />
          </div>
          <aside className="flex flex-col gap-4 w-[590px]">
            <ChatSection
              teamACounts={teamCounts?.teamA || 0}
              teamBCounts={teamCounts?.teamB || 0}
              team={selectedTeam}
              socket={socket}
              battleId={id}
              chats={chats || []}
              allChats={chats || []}
              userId={userId}
            />
            <ObjectionInput
              onSubmit={handleObjectionSubmit}
              phase={battleProgress?.phase}
              team={selectedTeam}
              turnStatus={battleProgress?.turn?.status}
            />
            <ObjectionVote
              objections={objections}
              onVote={handleVote}
              phase={battleProgress?.phase}
              team={selectedTeam}
            />
          </aside>
        </div>
      </main>

      {isTeamChangeModalOpen && (
        <TeamChangeModal
          aTeamCounts={10}
          bTeamCounts={8}
          noneTeamCounts={2}
          remainingTime={formattedTime}
          currentTeam={selectedTeam}
          handleTeamChange={handleTeamChange}
          onClose={closeTeamChangeModal}
        />
      )}

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
