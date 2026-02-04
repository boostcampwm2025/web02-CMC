import { Suspense } from 'react';
import LiveBattlesList from './LiveBattlesList';
import Skeleton from '@/commons/components/Skeleton';
import SectionErrorBoundary from '@/commons/components/ErrorBoundary/SectionErrorBoundary';
import SectionErrorFallback from '@/commons/components/ErrorBoundary/SectionErrorFallback';

export default function LiveBattlesSection() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col text-left gap-3">
          <span className="text-orange-500 text-sm uppercase tracking-wider">PLAY TO EARN GAMES</span>
          <h2 className="text-3xl font-bold">실시간 배틀</h2>
        </div>
      </div>
      <SectionErrorBoundary
        fallback={(error, reset) => (
          <SectionErrorFallback error={error} reset={reset} title="실시간 배틀을 불러올 수 없습니다" height="15rem" />
        )}
      >
        <Suspense
          fallback={
            <div className="grid grid-cols-3 gap-4 h-[15rem]">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} width="100%" height="100%" className="rounded-2xl" />
              ))}
            </div>
          }
        >
          <LiveBattlesList />
        </Suspense>
      </SectionErrorBoundary>
    </section>
  );
}
