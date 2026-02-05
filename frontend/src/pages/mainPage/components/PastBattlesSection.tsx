import { Suspense } from 'react';
import PastBattlesList from './PastBattlesList';
import Skeleton from '@/commons/components/Skeleton';
import SectionErrorBoundary from '@/commons/components/ErrorBoundary/SectionErrorBoundary';
import SectionErrorFallback from '@/commons/components/ErrorBoundary/SectionErrorFallback';

export default function PastBattlesSection() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col text-left gap-3">
          <span className="text-orange-500 text-sm uppercase">PAST BATTLES</span>
          <h2 className="text-3xl font-bold">지난 배틀 결과</h2>
        </div>
      </div>
      <SectionErrorBoundary
        fallback={(error, reset) => (
          <SectionErrorFallback
            error={error}
            reset={reset}
            title="지난 배틀 결과를 불러올 수 없습니다"
            height="36rem"
          />
        )}
      >
        <Suspense
          fallback={
            <div className="grid grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} width="100%" height="18rem" className="rounded-2xl" />
              ))}
            </div>
          }
        >
          <PastBattlesList />
        </Suspense>
      </SectionErrorBoundary>
    </section>
  );
}
