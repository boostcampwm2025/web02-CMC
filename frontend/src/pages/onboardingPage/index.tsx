import { useEffect } from 'react';
import GameIntroduceSection from './components/GameIntroduceSection';
import GameTitleSection from './components/GameTitleSection';

export default function OnBoardingPage() {
  useEffect(() => {
    document.documentElement.style.scrollSnapType = 'y mandatory';

    return () => {
      document.documentElement.style.scrollSnapType = '';
    };
  }, []);

  return (
    <main>
      <GameTitleSection />
      <GameIntroduceSection />
      <section className="h-screen w-full snap-start snap-always flex items-center justify-center">
        <h2>가치</h2>
      </section>
    </main>
  );
}
