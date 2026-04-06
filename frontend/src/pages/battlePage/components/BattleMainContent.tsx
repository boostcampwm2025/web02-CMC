import { useBattleStore, selectBattleProgress, selectSelectedTeam } from '../stores/battleStore';
import { isInputDisabled } from '../utils/battlePhase';
import CodeSection from './codeview/CodeSection';
import ChatSection from './chatting/ChatSection';
import DiscussionVote from './discussion/DiscussionVote';
import DiscussionInput from './discussion/DiscussionInput';

interface BattleMainContentProps {
  viewMode: 'split' | 'tab';
  onViewChange: (mode: 'split' | 'tab') => void;
  isSidebarOpen: boolean;
  language: string;
  codeA: string;
  codeB: string;
  onVote: (discussionId: number) => void;
  onDiscussionSubmit: (content: string) => void;
}

export default function BattleMainContent({
  viewMode,
  onViewChange,
  isSidebarOpen,
  language,
  codeA,
  codeB,
  onVote,
  onDiscussionSubmit
}: BattleMainContentProps) {
  const team = useBattleStore(selectSelectedTeam);
  const phase = useBattleStore(selectBattleProgress)?.phase;
  const shouldShowInput = !isInputDisabled(team, phase);

  return (
    <>
      <main className="main-width-closed">
        <div className="flex gap-2 py-4">
          <div className="flex-1 min-w-0">
            <CodeSection
              onViewChange={onViewChange}
              currentView={viewMode}
              language={language}
              codeA={codeA}
              codeB={codeB}
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
