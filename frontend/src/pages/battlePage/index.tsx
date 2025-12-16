import BattleHeader from './components/BattleHeader';

export default function BattlePage() {
  return (
    <div className="text-white">
      <BattleHeader
        title="배열에서 중복 제거하기"
        description="배열에서 중복된 요소를 제거하는 최적의 방법은?"
        status="A팀 이의 제기 중"
        timer="0:02"
        teamACounts={1}
        teamBCounts={1}
        teamNoneCounts={0}
      />
      <main className="flex">
        <section>code</section>
        <aside>
          <section>chatting</section>
          <section>이의제의 input</section>
          <section>투표</section>
        </aside>
      </main>
      <section>이의제기 & 반박 타임라인</section>
    </div>
  );
}
