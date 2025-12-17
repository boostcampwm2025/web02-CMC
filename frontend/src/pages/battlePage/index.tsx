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

type LocationState = {
  selectedTeam?: 'A' | 'B' | 'NONE';
};

export default function BattlePage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const battleInfo = useLoaderData<BattleInfo>();
  const [viewMode, setViewMode] = useState<'split' | 'tab'>('split');
  const [objections, setObjections] = useState<Objection[]>([]);

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

  const { selectedTeam = 'NONE' } = (state || {}) as LocationState;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { socket, battleData, isConnected } = useBattleSocket({
    battleId: id || '1',
    userId: 'abc',
    team: selectedTeam
  });

  return (
    <div className="text-white flex flex-col items-center">
      <div className="w-[1800px]">
        <BattleHeader
          title={battleInfo.title}
          description={battleInfo.description}
          status="A팀 의견 공유 중"
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
            <ObjectionInput onSubmit={handleObjectionSubmit} />
            <ObjectionVote objections={objections} onVote={handleVote} />
          </aside>
        </div>
      </main>
    </div>
  );
}
