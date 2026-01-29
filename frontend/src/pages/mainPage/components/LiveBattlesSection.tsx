import { useGetOpenBattles } from '../hooks/useGetOpenBattles';
import LiveBattlesList from './LiveBattlesList';
import SectionErrorBoundary from '@/commons/components/ErrorBoundary/SectionErrorBoundary';
import SectionErrorFallback from '@/commons/components/ErrorBoundary/SectionErrorFallback';

export default function LiveBattlesSection() {
  const { total: openTotal, isError } = useGetOpenBattles({ offset: 0, limit: 3 });

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col text-left gap-3">
          <span className="text-orange-500 text-sm uppercase tracking-wider">PLAY TO EARN GAMES</span>
          <h2 className="text-3xl  font-bold">실시간 배틀</h2>
        </div>

        <span className="text-sm text-gray-400">{isError ? '0' : openTotal}개 진행중</span>
      </div>
      <SectionErrorBoundary
        fallback={(error, reset) => (
          <SectionErrorFallback error={error} reset={reset} title="실시간 배틀을 불러올 수 없습니다" />
        )}
      >
        <LiveBattlesList />
      </SectionErrorBoundary>
    </section>
  );
}
