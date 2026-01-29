import { Link } from 'react-router-dom';
import StatCard from '@/pages/mainPage/components/StatCard';
import BattleCategoryCard from '@/pages/mainPage/components/BattleCategoryCard';
import LiveBattlesSection from '@/pages/mainPage/components/LiveBattlesSection';
import PastBattlesSection from '@/pages/mainPage/components/PastBattlesSection';
import { BATTLE_CATEGORY_CONFIG } from '@/pages/mainPage/types/battle';
import BattleIcon from '@/assets/icon/battle.svg?react';
import Header from '@/commons/components/Header';
import { useGetOpenBattles } from '@/pages/mainPage/hooks/useGetOpenBattles';
import { useGetClosedBattles } from '@/pages/mainPage/hooks/useGetClosedBattles';

export const BATTLE_CATEGORIES = Object.values(BATTLE_CATEGORY_CONFIG);

export default function MainPage() {
  const { total: openTotal } = useGetOpenBattles({ offset: 0, limit: 3 });
  const { total: closedTotal } = useGetClosedBattles({ offset: 0, limit: 6 });

  return (
    <div className="min-h-screen w-full">
      <Header />

      <main>
        <div className="mx-auto max-w-6xl px-6 py-10 space-y-12">
          {/* Hero */}
          <section className="flex flex-col gap-4 items-center">
            <div className="flex gap-6">
              <img src="logo.svg" alt="코문철 로고" className="w-16 h-16" />
              <h1 className="text-white text-6xl font-extrabold">코문철</h1>
            </div>

            <p className=" text-gray-400">두 가지 코드 구현 중 어떤 게 더 나은지 실시간 투표로 결정하세요</p>

            <div className="mt-6 flex gap-3">
              <Link
                className="flex items-center rounded-xl px-5 py-3  bg-orange-500 shadow-[0_4px_6px_-4px_rgba(255,105,0,0.3),0_10px_15px_-3px_rgba(255,105,0,0.3)] hover:shadow-[0_0_25px_rgba(255,105,0,0.7)] transition-all duration-200"
                to="/battle/create"
              >
                <div className="flex items-center gap-1 ">
                  <BattleIcon className="w-5 h-5 text-white" />
                  <p> 새 배틀 생성</p>
                </div>
              </Link>

              <Link
                to="/tutorial/team-select"
                className="flex items-center rounded-xl px-5 py-3 bg-[#1A1A2E] border border-[#364153] hover:bg-[#20203A]"
              >
                튜토리얼
              </Link>
            </div>
          </section>

          {/* Stats */}
          <section>
            <div className="grid grid-cols-3 gap-6">
              <StatCard type="TOTAL_BATTLES" value={openTotal + closedTotal} />
              <StatCard type="LIVE_BATTLES" value={openTotal} />
              <StatCard type="TOTAL_USERS" value={8567} />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-6">
              {BATTLE_CATEGORIES.slice(0, 3).map((c) => (
                <BattleCategoryCard key={c.key} title={c.title} description={c.description} />
              ))}
            </div>
          </section>

          <LiveBattlesSection />
          <PastBattlesSection />
        </div>
      </main>
    </div>
  );
}
