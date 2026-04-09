import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBattleStore, selectBattleProgress, selectSelectedTeam } from '../stores/battleStore';
import { isInputDisabled } from '../utils/battlePhase';
import { useGetBattleInfo } from '@/commons/hooks/useGetBattleInfo';
import CodeSection from './codeview/CodeSection';
import ChatSection from './chatting/ChatSection';
import DiscussionVote from './discussion/DiscussionVote';
import DiscussionInput from './discussion/DiscussionInput';

interface BattleMainContentProps {
  isSidebarOpen: boolean;
  onVote: (discussionId: number) => void;
  onDiscussionSubmit: (content: string) => void;
}

export default function BattleMainContent({ isSidebarOpen, onVote, onDiscussionSubmit }: BattleMainContentProps) {
  const [viewMode, setViewMode] = useState<'split' | 'tab'>('split');
  const { id: battleId } = useParams<{ id: string }>();
  const { battleInfo: { language, aCode: codeA, bCode: codeB } = {} } = useGetBattleInfo(battleId!);
  const team = useBattleStore(selectSelectedTeam);
  const phase = useBattleStore(selectBattleProgress)?.phase;
  const shouldShowInput = !isInputDisabled(team, phase);

  return (
    <>
      <main className="main-width-closed">
        <div className="flex gap-2 py-4">
          <div className="flex-1 min-w-0">
            <CodeSection
              onViewChange={setViewMode}
              currentView={viewMode}
              language={language ?? 'javascript'}
              codeA={codeA ?? ''}
              codeB={codeB ?? ''}
            />
          </div>
          <aside
            className={`flex flex-col gap-4 transition-all duration-300 ${isSidebarOpen ? 'lounge-width-open' : 'lounge-width-closed'}`}
          >
            <DiscussionVote onVote={onVote} />
            <ChatSection />
          </aside>
        </div>
      </main>
      <div
        className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 z-5 px-4 pb-4 transition-all duration-500 ease-out ${
          shouldShowInput ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="discussion-input-width">
          {shouldShowInput && <DiscussionInput key={phase} onSubmit={onDiscussionSubmit} />}
        </div>
      </div>
    </>
  );
}
