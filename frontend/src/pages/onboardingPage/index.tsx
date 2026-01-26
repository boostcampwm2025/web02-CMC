import { useEffect } from 'react';
import GameIntroduceSection from './components/GameIntroduceSection';

export default function OnBoardingPage() {
  useEffect(() => {
    document.documentElement.style.scrollSnapType = 'y mandatory';

    return () => {
      document.documentElement.style.scrollSnapType = '';
    };
  }, []);

  return (
    <main>
      <section className="h-screen w-full snap-start snap-always flex items-center justify-center">
        <h1>로고</h1>
      </section>
      <GameIntroduceSection />
      <section className="h-screen w-full snap-start snap-always flex items-center justify-center">
        <h2>가치</h2>
      </section>
    </main>
  );
}
