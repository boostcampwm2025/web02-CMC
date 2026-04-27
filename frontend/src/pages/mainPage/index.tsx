import Header from '@/commons/components/Header';
import HeroSection from './components/HeroSection';
import CategoryList from './components/CategoryList';
import LiveBattleList from './components/liveBattles/LiveBattleList';
import PastBattleList from './components/pastBattles/PastBattleList';
import MainPageModalLayer from './components/modals/MainPageModalLayer';
import useMainPageModals from './hooks/useMainPageModals';

export default function MainPage() {
  const { loginModal, nicknameModal } = useMainPageModals();

  return (
    <div className="min-h-screen w-full">
      <Header onLoginClick={loginModal.openModal} onNicknameClick={nicknameModal.openModal} />
      <MainPageModalLayer loginModal={loginModal} nicknameModal={nicknameModal} />

      <main>
        <div className="mx-auto max-w-6xl px-6 py-10 space-y-12">
          <HeroSection />
          <CategoryList />
          <LiveBattleList />
          <PastBattleList />
        </div>
      </main>
    </div>
  );
}
