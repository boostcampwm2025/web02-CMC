import { useState } from 'react';
import { useParams, useLoaderData, useLocation } from 'react-router-dom';
import type { BattleInfo } from '@/commons/types/battle';
import BattleHeader from './components/header/BattleHeader';
import CodeSection from './components/codeview/CodeSection';
import ChatSection from './components/chatting/ChatSection';
import ObjectionInput from './components/objection/ObjectionInput';
import ObjectionVote, { type Objection } from './components/objection/ObjectionVote';
import TimelineSection from './components/timeline/TimelineSection';
import { useBattleSocket } from './hooks/useBattleSocket';
import useModal from '@/commons/hooks/useModal';
import TeamChangeModal from './components/modals/TeamChangeModal';

type LocationState = {
  selectedTeam?: 'A' | 'B' | 'NONE';
};

export default function BattlePage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const { selectedTeam = 'NONE' } = (state || {}) as LocationState;
  const battleInfo = useLoaderData<BattleInfo>();
  const [viewMode, setViewMode] = useState<'split' | 'tab'>('split');
  const [objections, setObjections] = useState<Objection[]>([]);
  const { isOpen: isTeamChangeModalOpen, closeModal: closeTeamChangeModal } = useModal(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { socket, battleData, battleProgress, isConnected } = useBattleSocket({
    battleId: id || '1',
    userId: 'abc',
    team: selectedTeam
  });

  const getTotalVotes = () => {
    return objections.reduce((sum, obj) => sum + obj.votes, 0);
  };

  const handleVote = (objectionId: number) => {
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
    // @ Todo 소켓으로 투표 정보 전송 로직 추가 필요
  };

  const handleObjectionSubmit = (content: string) => {
    const newObjection: Objection = {
      id: Date.now(),
      user: 'You',
      team: 'A', // @ Todo 실제 팀 정보로 대체 필요
      content,
      votes: 0,
      totalVotes: getTotalVotes(),
      hasVoted: false
    };

    setObjections((prev) => [...prev, newObjection]);
    // @ Todo 소켓으로 이의제기 정보 전송 로직 추가 필요
  };

  //@Todo 턴 변경 정보 이벤트 구독 소켓 로직 추가 필요
  //@Todo 초기 이의제기/반론 목록 로드 소켓 로직 추가 필요
  const handleTeamChange = (team: 'A' | 'B' | 'NONE') => {
    console.log(team);
    // @ Todo 팀 변경 로직 추가 필요
    closeTeamChangeModal();
  };

  return (
    <div className="text-white flex flex-col items-center">
      <div className="w-[1800px]">
        <BattleHeader
          title="배열에서 중복 제거하기"
          description="배열에서 중복된 요소를 제거하는 최적의 방법은?"
          status={battleProgress?.phase || 'OPINION_SHARE'}
          timer="0:02"
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
            <ChatSection aTeamMemebers={102} team={selectedTeam} />
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
          remainingTime={30}
          currentTeam={selectedTeam}
          handleTeamChange={handleTeamChange}
          onClose={closeTeamChangeModal}
        />
      )}
    </div>
  );
}
