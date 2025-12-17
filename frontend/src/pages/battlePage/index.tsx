import { useState } from 'react';
import { useParams, useLoaderData } from 'react-router-dom';
import type { BattleInfo } from '@/commons/types/battle';
import BattleHeader from './components/header/BattleHeader';
import CodeSection from './components/codeview/CodeSection';
import ChatSection from './components/chatting/ChatSection';
import TimelineSection from './components/timeline/TimelineSection';
import { useBattleSocket } from './hooks/useBattleSocket';

export default function BattlePage() {
  const { id } = useParams<{ id: string }>();
  const battleInfo = useLoaderData<BattleInfo>();
  const [viewMode, setViewMode] = useState<'split' | 'tab'>('split');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { socket, battleData, isConnected } = useBattleSocket({
    battleId: id || '1',
    userId: 'abc',
    team: 'A'
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
        <div className="flex gap-4 py-4">
          <CodeSection
            onViewChange={setViewMode}
            currentView={viewMode}
            language="javascript"
            codeA={battleInfo.aCode}
            codeB={battleInfo.bCode}
          />
          <aside className="flex flex-col gap-4">
            <ChatSection aTeamMemebers={102} />
            <section>이의제의 input</section>
            <section>투표</section>
          </aside>
        </div>
        <TimelineSection />
      </main>
    </div>
  );
}
