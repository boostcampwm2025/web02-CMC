import { useEffect } from 'react';
import GameIntroduceSection from './components/GameIntroduceSection';
import GameTitleSection from './components/GameTitleSection';
import ServiceValueSection from './components/ServiceValueSection';

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
      <ServiceValueSection />
    </main>
  );
}
