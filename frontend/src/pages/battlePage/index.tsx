import { useState, useEffect } from 'react';
import { useParams, useLoaderData, useLocation } from 'react-router-dom';
import type { BattleInfo, BattleAttackedResult, BattleDefensedResult } from '@/commons/types/battle';
import BattleHeader from './components/header/BattleHeader';
import CodeSection from './components/codeview/CodeSection';
import ChatSection from './components/chatting/ChatSection';
import ObjectionInput from './components/objection/ObjectionInput';
import ObjectionVote, { type Objection } from './components/objection/ObjectionVote';
import TimelineSection from './components/timeline/TimelineSection';
import { useBattleSocket } from './hooks/useBattleSocket';
import { useBattleTimer } from './hooks/useBattleTimer';
import { useEffectModal } from './hooks/useEffectModal';
import { getObjectionConfig, isInputDisabled } from './utils/battlePhase';
import useModal from '@/commons/hooks/useModal';
import TeamChangeModal from './components/modals/TeamChangeModal';
import ObjectionModal from './components/effects/ObjectionModal';

type LocationState = {
  selectedTeam?: 'A' | 'B' | 'NONE';
};

export default function BattlePage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  // const { selectedTeam = 'NONE' } = (state || {}) as LocationState;
  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B' | 'NONE'>(
    (state as LocationState)?.selectedTeam || 'NONE'
  );

  const battleInfo = useLoaderData<BattleInfo>();
  const [viewMode, setViewMode] = useState<'split' | 'tab'>('split');
  const [objections, setObjections] = useState<Objection[]>([]);
  const { effectModal, showEffect, hideEffect } = useEffectModal();
  const {
    isOpen: isTeamChangeModalOpen,
    openModal: openTeamChangeModal,
    closeModal: closeTeamChangeModal
  } = useModal(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { socket, currentStage, battleProgress, isConnected, battleData } = useBattleSocket({
    battleId: id || '1',
    userId: 'abc',
    team: selectedTeam
  });

  const { formattedTime } = useBattleTimer({
    expiredAt: battleProgress?.expiredAt
  });

  useEffect(() => {
    if (battleProgress?.phase === 'TEAM_SWITCH') {
      openTeamChangeModal();
    }
  }, [battleProgress?.phase, openTeamChangeModal]);

  // 턴 변경 시 투표 리스트 초기화
  useEffect(() => {
    setObjections([]);
  }, [battleProgress?.turn?.status, battleProgress?.phase]);

  // 투표 결과 업데이트 수신
  useEffect(() => {
    if (!socket) return;

    const handleVoteUpdate = (data: { discussionId: string; upvotes: number; votes: string[] }) => {
      setObjections((prev) => {
        const updated = prev.map((obj) => {
          const isTarget = String(obj.id) === data.discussionId;
          return isTarget ? { ...obj, votes: data.upvotes, hasVoted: data.votes.includes('abc') } : obj;
        });
        const totalVotes = updated.reduce((sum, obj) => sum + obj.votes, 0);
        return updated.map((obj) => ({ ...obj, totalVotes }));
      });
    };

    // 다른 사람이 제출한 이의제기/반론 수신
    const handleNewAttack = (data: {
      discussionId: string;
      authorId: string;
      content: string;
      upvotes: number;
      votes: string[];
    }) => {
      setObjections((prev) => {
        const totalVotes = prev.reduce((sum, obj) => sum + obj.votes, 0);

        if (selectedTeam === 'NONE') {
          return prev;
        }
        const newObjection: Objection = {
          id: data.discussionId as unknown as number,
          user: data.authorId === 'abc' ? 'You' : `User-${data.authorId.slice(0, 4)}`,
          team: selectedTeam,
          content: data.content,
          votes: data.upvotes,
          totalVotes,
          hasVoted: data.votes.includes('abc')
        };

        return [...prev, newObjection];
      });
    };

    const handleNewDefense = (data: {
      discussionId: string;
      authorId: string;
      content: string;
      upvotes: number;
      votes: string[];
    }) => {
      setObjections((prev) => {
        if (selectedTeam === 'NONE') {
          return prev;
        }
        const totalVotes = prev.reduce((sum, obj) => sum + obj.votes, 0);
        const newObjection: Objection = {
          id: data.discussionId as unknown as number,
          user: data.authorId === 'abc' ? 'You' : `User-${data.authorId.slice(0, 4)}`,
          team: selectedTeam,
          content: data.content,
          votes: data.upvotes,
          totalVotes,
          hasVoted: data.votes.includes('abc')
        };

        return [...prev, newObjection];
      });
    };

    socket.on('Battle:AttackVoteUpdate', handleVoteUpdate);
    socket.on('Battle:DefenseVoteUpdate', handleVoteUpdate);
    socket.on('Battle:NewAttack', handleNewAttack);
    socket.on('Battle:NewDefense', handleNewDefense);

    return () => {
      socket.off('Battle:AttackVoteUpdate', handleVoteUpdate);
      socket.off('Battle:DefenseVoteUpdate', handleVoteUpdate);
      socket.off('Battle:NewAttack', handleNewAttack);
      socket.off('Battle:NewDefense', handleNewDefense);
    };
  }, [socket, selectedTeam]);

  // battle:attacked / battle:defensed 이벤트 처리
  useEffect(() => {
    if (!socket) return;

    const handleAttacked = (data: BattleAttackedResult) => {
      const attackTeam = selectedTeam === 'A' ? 'B' : 'A';
      showEffect(attackTeam, data.attack.content, 'attack');
    };
    const handleDefensed = (data: BattleDefensedResult) => {
      showEffect(selectedTeam, data.defense.content, 'defense');
    };

    socket.on('battle:attacked', handleAttacked);
    socket.on('battle:defensed', handleDefensed);

    return () => {
      socket.off('battle:attacked', handleAttacked);
      socket.off('battle:defensed', handleDefensed);
    };
  }, [socket, selectedTeam, showEffect]);

  const handleVote = (objectionId: number) => {
    if (!socket || selectedTeam === 'NONE') return;

    const targetObjection = objections.find((obj) => obj.id === objectionId);
    if (targetObjection?.hasVoted) return;

    const { isAttacking } = getObjectionConfig(selectedTeam, battleProgress?.phase);
    const eventName = isAttacking ? 'Battle:AttackVote' : 'Battle:DefenseVote';

    socket.emit(eventName, {
      battleId: id || '1',
      discussionId: String(objectionId),
      userId: 'abc', // TODO: 실제 userId로 교체 필요
      team: selectedTeam
    });

    setObjections((prev) => {
      const updated = prev.map((obj) => {
        if (obj.id === objectionId) {
          return { ...obj, hasVoted: true, votes: obj.votes + 1 };
        } else if (obj.hasVoted) {
          return { ...obj, hasVoted: false, votes: obj.votes - 1 };
        }
        return obj;
      });

      const totalVotes = updated.reduce((sum, obj) => sum + obj.votes, 0);
      return updated.map((obj) => ({ ...obj, totalVotes }));
    });
  };

  const handleObjectionSubmit = (content: string) => {
    if (selectedTeam === 'NONE' || !socket) return;

    const { isAttacking } = getObjectionConfig(selectedTeam, battleProgress?.phase);
    const canSubmit = !isInputDisabled(selectedTeam, battleProgress?.phase, battleProgress?.turn?.status);

    if (!canSubmit) {
      return;
    }

    socket.emit(isAttacking ? 'Battle:Attack' : 'Battle:Defense', {
      battleId: id || '1',
      authorId: 'abc', // TODO: 실제 userId로 교체 필요
      content,
      team: selectedTeam
    });

    // 서버에서 Battle:NewAttack/NewDefense로 받을 예정이므로 여기서는 optimistic update 제거
    // 중복 추가 방지
  };

  //@Todo 초기 이의제기/반론 목록 로드 소켓 로직 추가 필요

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

  return (
    <div className="text-white flex flex-col items-center">
      <div className="w-[1800px]">
        <BattleHeader
          title="배열에서 중복 제거하기"
          description="배열에서 중복된 요소를 제거하는 최적의 방법은?"
          status={currentStage || 'END'}
          timer={formattedTime}
          teamACounts={1}
          teamBCounts={1}
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
            <TimelineSection />
          </div>
          <aside className="flex flex-col gap-4 w-[590px]">
            <ChatSection
              aTeamMemebers={102}
              team={selectedTeam}
              socket={socket}
              battleId={id}
              chats={battleData?.chats || []}
              allChats={battleData?.allChats || []}
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
