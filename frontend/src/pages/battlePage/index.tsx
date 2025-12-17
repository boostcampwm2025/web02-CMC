import { useState } from 'react';
import BattleHeader from './components/header/BattleHeader';
import CodeSection from './components/codeview/CodeSection';
import ChatSection from './components/chatting/ChatSection';
import TimelineSection from './components/timeline/TimelineSection';
import { useBattleSocket } from './hooks/useBattleSocket';

const MOCK_CODE = {
  A: `function removeDuplicates(arr) {
  return [...new Set(arr)];
}

// 사용 예시
const numbers = [1, 2, 2, 3, 4, 4, 5];
console.log(removeDuplicates(numbers));`,
  B: `function removeDuplicates(arr) {
  const result = [];
  const seen = {};
  
  for (let i = 0; i < arr.length; i++) {
    if (!seen[arr[i]]) {
      seen[arr[i]] = true;
      result.push(arr[i]);
    }
  }
  
  return result;
}

// 사용 예시
const numbers = [1, 2, 2, 3, 4, 4, 5];
console.log(removeDuplicates(numbers));`
};

export default function BattlePage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { socket, battleData, isConnected } = useBattleSocket({
    battleId: '1',
    userId: 'abc',
    team: 'A'
  });
  const [viewMode, setViewMode] = useState<'split' | 'tab'>('split');

  return (
    <div className="text-white flex flex-col items-center">
      <div className="w-[1800px]">
        <BattleHeader
          title="배열에서 중복 제거하기"
          description="배열에서 중복된 요소를 제거하는 최적의 방법은?"
          status="A팀 이의 제기 중"
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
            codeA={MOCK_CODE.A}
            codeB={MOCK_CODE.B}
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
