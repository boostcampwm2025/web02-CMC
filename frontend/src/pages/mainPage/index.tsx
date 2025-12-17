import { Link } from 'react-router-dom';
import { StatCard, LiveBattleCard } from './components/index';
import type { BattleCardItem } from './types';

const LIVE_BATTLES: BattleCardItem[] = [
  {
    id: 'live-1',
    title: 'Promise vs Async/Await',
    description: '비동기 처리 로직, 가독성과 에러 핸들링 측면에서 어떤 방식이 더 좋을까요?',
    status: 'LIVE',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 6 * 60 * 1000 + 58 * 1000),
    clientCount: 128,
    category: 'implementation',
    timeLabel: '6:58'
  },
  {
    id: 'live-2',
    title: 'for문 vs Array.map',
    description: '대규모 데이터 처리 시 성능과 가독성, 어느 쪽을 선택하시나요?',
    status: 'LIVE',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 3 * 60 * 1000 + 21 * 1000),
    clientCount: 94,
    category: 'algorithm',
    timeLabel: '3:21'
  },
  {
    id: 'live-3',
    title: '중복 로직 제거 리팩토링',
    description: '공통 유틸 함수로 분리하는 것이 항상 최선일까요?',
    status: 'LIVE',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 1 * 60 * 1000 + 12 * 1000),
    clientCount: 76,
    category: 'refactoring',
    timeLabel: '1:12'
  },
  {
    id: 'live-4',
    title: '환경 변수 관리 방식',
    description: 'dotenv vs 런타임 주입, 실무에서는 어떤 접근이 좋을까요?',
    status: 'LIVE',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 47 * 1000),
    clientCount: 52,
    category: 'etc',
    timeLabel: '0:47'
  }
];

export default function MainPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-12">
      {/* Header */}
      <section className="rounded-2xl bg-[#1a1a2e] p-8">
        <h1 className="text-3xl font-bold text-white">코드 리뷰 배틀 아레나</h1>
        <p className="mt-2 text-gray-300">실시간 투표로 더 나은 코드를 선택하세요</p>

        <div className="mt-6 flex gap-3">
          <Link className="rounded-xl bg-orange-500 px-5 py-3 text-white" to="/battle/create">
            새 배틀 생성
          </Link>
          <Link className="rounded-xl border px-5 py-3 text-white" to="/team-select">
            배틀 참여
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <StatCard label="진행된 배틀" value="1,234" />
          <StatCard label="실시간 배틀" value="42" />
          <StatCard label="참여 개발자" value="8,567" />
        </div>
      </section>

      {/* Live */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col text-left gap-3">
            <span className="text-[#FF6900] text-sm uppercase tracking-wider">PLAY TO EARN GAMES</span>
            <h2 className="text-3xl  font-bold text-white">실시간 배틀</h2>
          </div>

          <span className="text-sm text-gray-400">{LIVE_BATTLES.length}개 진행중</span>
        </div>
        <div className=" flex gap-4 overflow-x-auto pb-2">
          {LIVE_BATTLES.map((b) => (
            <LiveBattleCard key={b.id} item={b} />
          ))}
        </div>

        <button className="mt-4 w-full bg-[#1E1E2F] border border-[#2D2D3F] rounded-xl py-3 text-white text-[14px] hover:bg-[#2D2D3F] transition-colors">
          더 많은 배틀 보기
        </button>
      </section>
    </div>
  );
}
