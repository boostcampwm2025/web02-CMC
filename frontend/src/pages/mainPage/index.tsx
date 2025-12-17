import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatCard, LiveBattleCard, BattleCategoryCard } from './components/index';
import type { BattleCardItem } from './types/battle';
import BattleIcon from '@/assets/icon/battle.svg?react';

import { getOpenBattles, getClosedBattles } from './api/getBattleList';

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

export default function MainPage() {
  const [openBattles, setOpenBattles] = useState<BattleCardItem[]>([]);
  const [closedBattles, setClosedBattles] = useState<BattleCardItem[]>([]);

  const [openTotal, setOpenTotal] = useState(0);
  const [closedTotal, setClosedTotal] = useState(0);

  useEffect(() => {
    const fetchBattles = async () => {
      const [openRes, closedRes] = await Promise.all([
        getOpenBattles({ offset: 0, limit: 3 }),
        getClosedBattles({ offset: 0, limit: 6 })
      ]);

      setOpenBattles(openRes.battles);
      setOpenTotal(openRes.meta.total);

      setClosedBattles(closedRes.battles);
      setClosedTotal(closedRes.meta.total);
    };

    fetchBattles();
  }, []);

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
              <BattleIcon className="w-5 h-5" style={{ color: 'white' }} />
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
          <StatCard type="TOTAL_BATTLES" value="1,234" />
          <StatCard type="LIVE_BATTLES" value="42" />
          <StatCard type="TOTAL_USERS" value="8,567" />
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

          <span className="text-sm text-gray-400">{openTotal}개 진행중</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {openBattles.map((b) => (
            <LiveBattleCard key={b.id} item={b} />
          ))}
        </div>

        <button className="mt-4 w-full bg-[#1E1E2F] border border-[#2D2D3F] rounded-xl py-3 text-white text-[14px] hover:bg-[#2D2D3F] transition-colors">
          더 많은 배틀 보기
        </button>
      </section>

      {/* Past */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col text-left gap-3">
            <span className="text-[#FF6900] text-sm uppercase tracking-wider">PAST BATTLES</span>
            <h2 className="text-3xl  font-bold text-white">지난 배틀 결과</h2>
          </div>

          <span className="text-sm text-gray-400">{closedTotal}개 진행중</span>
        </div>
        <div className="grid  grid-cols-3 gap-4">
          {closedBattles.map((b) => (
            <LiveBattleCard key={b.id} item={b} />
          ))}
        </div>

        <button className="mt-4 w-full bg-[#1E1E2F] border border-[#2D2D3F] rounded-xl py-3 text-white text-[14px] hover:bg-[#2D2D3F] transition-colors">
          더 많은 지난 배틀 보기
        </button>
      </section>
    </div>
  );
}
