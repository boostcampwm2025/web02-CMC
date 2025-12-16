import { useState } from 'react';
import BattleHeader from './components/BattleHeader';
import CodeSection from './components/CodeSection';
import ChatSection from './components/chatting/ChatSection';

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
      <main className="flex gap-4 py-4 w-[1800px]">
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
      </main>
      <section className="w-[1800px]">이의제기 & 반박 타임라인</section>
    </div>
  );
}
