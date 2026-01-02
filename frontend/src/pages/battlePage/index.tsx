import { useState, useEffect } from 'react';
import { useParams, useLoaderData, useLocation, useNavigate } from 'react-router-dom';
import type { BattleInfo, BattleAttackedResult, BattleDefensedResult } from '@/commons/types/battle';
import BattleHeader from './components/header/BattleHeader';
import CodeSection from './components/codeview/CodeSection';
import ChatSection from './components/chatting/ChatSection';
import ObjectionInput from './components/objection/ObjectionInput';
import ObjectionVote from './components/objection/ObjectionVote';
import TimelineSection from './components/timeline/TimelineSection';
import { useBattleSocket } from './hooks/useBattleSocket';
import { useBattleTimer } from './hooks/useBattleTimer';
import { useEffectModal } from './hooks/useEffectModal';
import { useBattleProgress } from './hooks/useBattleProgress';
import { useBattleDiscussions } from './hooks/useBattleDiscussions';
import {
  useBattleStore,
  selectSocket,
  selectCurrentStage,
  selectBattleProgress,
  selectDiscussions,
  selectTeamCounts,
  selectTimelines,
  selectChats
} from './stores/battleStore';
import useModal from '@/commons/hooks/useModal';
import TeamChangeModal from './components/modals/TeamChangeModal';
import ObjectionModal from './components/effects/ObjectionModal';

type LocationState = {
  selectedTeam?: 'A' | 'B' | 'NONE';
};

export default function BattlePage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B' | 'NONE'>(
    (state as LocationState)?.selectedTeam || 'NONE'
  );

  const battleInfo = useLoaderData<BattleInfo>();
  const [viewMode, setViewMode] = useState<'split' | 'tab'>('split');
  const { effectModal, showEffect, hideEffect } = useEffectModal();
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
    team: selectedTeam
  });

  const socket = useBattleStore(selectSocket);
  const currentStage = useBattleStore(selectCurrentStage);
  const battleProgress = useBattleStore(selectBattleProgress);
  const objections = useBattleStore(selectDiscussions);
  const teamCounts = useBattleStore(selectTeamCounts);
  const timelines = useBattleStore(selectTimelines);
  const chats = useBattleStore(selectChats);

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

  useEffect(() => {
    if (battleProgress?.phase === 'TEAM_SWITCH') {
      const timer = setTimeout(() => {
        openTeamChangeModal();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [battleProgress?.phase, openTeamChangeModal]);

  // 턴 변경 시 투표 리스트 초기화
  useEffect(() => {
    if (!socket) return;

    const handleAttacked = (data: BattleAttackedResult) => {
      // 턴 상태로 공격하는 팀 판단
      const attackingTeam = battleProgress?.turn?.status === 'A_ATTACK' ? 'A' : 'B';
      showEffect(attackingTeam, data.attack.text, 'attack');
    };
    const handleDefensed = (data: BattleDefensedResult) => {
      // 턴 상태로 방어하는 팀 판단
      const defendingTeam = battleProgress?.turn?.status === 'A_DEFENSE' ? 'A' : 'B';
      showEffect(defendingTeam, data.defense.text, 'defense');
    };

    socket.on('battle:attacked', handleAttacked);
    socket.on('battle:defensed', handleDefensed);

    return () => {
      socket.off('battle:attacked', handleAttacked);
      socket.off('battle:defensed', handleDefensed);
    };
  }, [socket, battleProgress?.turn?.status, showEffect]);

  useEffect(() => {
    if (!socket) return;

    const handleChangedTeam = (data: { battleId: string; team: 'A' | 'B' | 'NONE' }) => {
      setSelectedTeam(data.team);
    };

    socket.on('battle:team:update', handleChangedTeam);

    return () => {
      socket.off('battle:team:update', handleChangedTeam);
    };
  }, [socket]);

  const handleTeamChange = (team: 'A' | 'B' | 'NONE') => {
    if (!socket) return;
    socket.emit('battle:teamVote', { battleId: id, team });

    closeTeamChangeModal();
  };

  useEffect(() => {
    if (!socket) return;

    const handleBattleClosed = (payload: { battleId: string }) => {
      navigate(`/battle/${payload.battleId}/result`);
    };

    socket.on('battle:closed', handleBattleClosed);

    return () => {
      socket.off('battle:closed', handleBattleClosed);
    };
  }, [socket, navigate]);

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
