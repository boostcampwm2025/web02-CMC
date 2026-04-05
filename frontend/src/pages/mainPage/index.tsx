import { Link, useNavigate } from 'react-router-dom';
import BattleCategoryCard from '@/pages/mainPage/components/BattleCategoryCard';
import LiveBattlesSection from './components/liveBattles/LiveBattlesSection';
import PastBattlesSection from './components/pastBattles/PastBattlesSection';
import { BATTLE_CATEGORY_CONFIG } from '@/pages/mainPage/types/battle';
import Icon from '@/commons/components/Icon';
import Header from '@/commons/components/Header';
import Button from '@/commons/components/Button';
import { useAuthStore, selectUser } from '@/commons/stores/authStore';
import { useToastStore, selectAddToast } from '@/commons/stores/toastStore';

export const BATTLE_CATEGORIES = Object.values(BATTLE_CATEGORY_CONFIG);

export default function MainPage() {
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);
  const addToast = useToastStore(selectAddToast);

  const handleCreateBattle = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      addToast({ message: '로그인 후 이용 가능합니다.' });
      return;
    }
    navigate('/battle/create');
  };

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
              <Button
                onClick={handleCreateBattle}
                className="shadow-[0_4px_6px_-4px_rgba(255,105,0,0.3),0_10px_15px_-3px_rgba(255,105,0,0.3)] hover:shadow-[0_0_25px_rgba(255,105,0,0.7)]"
              >
                <Icon name="battle" className="w-5 h-5 text-white" />새 배틀 생성
              </Button>

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
