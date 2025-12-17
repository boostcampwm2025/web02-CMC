import { Link } from 'react-router-dom';
import { StatCard, LiveBattleCard, BattleCategoryCard } from './components/index';
import type { BattleCardItem } from './types';
import BattleWhiteIcon from '@/assets/icon/battle-white.svg?react';

const BATTLE_CATEGORIES = [
  {
    key: 'algorithm',
    title: '⚡ 알고리즘 배틀',
    description: '성능과 효율성을 겨루는 알고리즘 대결'
  },
  {
    key: 'refactoring',
    title: '🎨 리팩토링 배틀',
    description: '클린 코드 vs 실용성의 대결'
  },
  {
    key: 'implementation',
    title: '💡 구현 배틀',
    description: '같은 기능, 다른 접근법의 대결'
  }
];

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
      <section className="flex  flex-col gap-4 items-center">
        <div className="flex gap-6">
          <img src="logo.svg" alt="코문철 로고" className="w-16 h-16" />
          <h1 className=" text-white text-6xl font-extrabold">코문철</h1>
        </div>

        <p className=" text-gray-400">두 가지 코드 구현 중 어떤 게 더 나은지 실시간 투표로 결정하세요</p>

        <div className="mt-6 flex gap-3">
          <Link
            className="flex items-center rounded-xl px-5 py-3  bg-orange-500 shadow-[0_4px_6px_-4px_rgba(255,105,0,0.3),0_10px_15px_-3px_rgba(255,105,0,0.3)] hover:shadow-[0_0_25px_rgba(255,105,0,0.7)] transition-all duration-200"
            to="/battle/create"
          >
            <div className="flex items-center gap-1 ">
              <BattleWhiteIcon className="w-5 h-5" />
              <p> 새 배틀 생성</p>
            </div>
          </Link>

          <Link
            to="/team-select"
            className="flex items-center rounded-xl px-5 py-3  bg-[#1A1A2E] border border-[#364153] hover:bg-[#20203A] transition-colors duration-200"
          >
            배틀 참여
          </Link>
        </div>
      </section>

      {/* info */}
      <section>
        <div className="mt-6 grid grid-cols-3 gap-6">
          <StatCard label="진행된 배틀" value="1,234" />
          <StatCard label="실시간 배틀" value="42" />
          <StatCard label="참여 개발자" value="8,567" />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-6">
          {BATTLE_CATEGORIES.map((c) => (
            <BattleCategoryCard key={c.key} title={c.title} description={c.description} />
          ))}
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
