import { useEffect } from 'react';
import GameIntroduceSection from './components/GameIntroduceSection';
import GameTitleSection from './components/GameTitleSection';
import ServiceValueSection from './components/ServiceValueSection';

export default function EntryPage() {
  useEffect(() => {
    document.documentElement.style.scrollSnapType = 'y mandatory';

    return () => {
      document.documentElement.style.scrollSnapType = '';
    };
  }, []);

  return (
    <main className="font-['Mulmaru']">
      <GameTitleSection />
      <GameIntroduceSection />
      <ServiceValueSection />
    </main>
  );
}
