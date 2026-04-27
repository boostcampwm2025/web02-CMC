import Icon from '@/commons/components/Icon';
import type { Mvp, TimelineItem } from '../types';

interface MvpCardProps {
  mvpList: Mvp[];
  bestOpinion: TimelineItem | null;
}

export default function MvpCard({ mvpList, bestOpinion }: MvpCardProps) {
  const mvp = mvpList[0];
  const runners = mvpList.slice(1);

  if (!mvp) return null;
  return (
    <div className="rounded-xl overflow-hidden relative shadow-2xl h-full">
      {/* 오렌지 그라데이션 배경 및 패턴 */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400">
        {/* 빛나는 애니메이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine"></div>

        {/* 패턴 오버레이 */}
        <img src="/mvp-pattern.svg" className="absolute inset-0 w-full h-full opacity-10 object-cover" alt="" />
      </div>

      {/* 컨텐츠 */}
      <div className="relative z-10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
          <h3 className="text-white font-bold">MVP</h3>
        </div>

        <div className="flex flex-col items-center text-center gap-4">
          {/* MVP 아이콘 및 뱃지 */}
          <div className="relative">
            <div className="bg-white/20 backdrop-blur-sm p-5 rounded-2xl border-2 border-white/30">
              <Icon name="crown" className="w-12 h-12 text-yellow-300" />
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-orange-900 px-2.5 py-0.5 rounded-full text-xs font-bold border-2 border-white shadow-lg">
              MVP
            </div>
          </div>

          {/* MVP 정보 */}
          <div className="w-full">
            <div className="inline-block px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full text-white text-xs mb-2 border border-white/20">
              최고의 전략가
            </div>
            <div className="flex items-center justify-center gap-2 mb-3">
              <h4 className="text-2xl font-bold text-white">{mvp.nickname}</h4>
              <div
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  mvp.team === 'A'
                    ? 'bg-blue-500/30 text-blue-200 border border-blue-400/50'
                    : mvp.team === 'B'
                      ? 'bg-red-500/30 text-red-200 border border-red-400/50'
                      : 'bg-gray-500/30 text-gray-200 border border-gray-400/50'
                }`}
              >
                {mvp.team === 'A' ? '코드 A' : mvp.team === 'B' ? '코드 B' : '중립'}팀
              </div>
            </div>

            {/* 최고 의견 */}
            {bestOpinion && (
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-start gap-2 mb-2">
                  <Icon name="award" className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-1" />
                  <div className="flex-1 text-left">
                    <div className="text-white/90 text-xs font-medium mb-1">가장 많은 좋아요를 받은 의견</div>
                    <p className="text-white text-sm leading-relaxed break-all">{bestOpinion.content}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-white/10">
                  <Icon name="like" className="w-4 h-4 text-yellow-300" />
                  <span className="text-xl font-bold text-white">{bestOpinion.upvotes}</span>
                  <span className="text-white/80 text-sm">좋아요</span>
                </div>
              </div>
            )}

            {/* MVP 통계 */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-2 border border-white/10">
                <div className="text-white/70 text-xs">총 좋아요</div>
                <div className="text-white font-bold">{mvp.totalVotes}</div>
              </div>
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-2 border border-white/10">
                <div className="text-white/70 text-xs">제출 의견</div>
                <div className="text-white font-bold">{mvp.opinionCount}개</div>
              </div>
            </div>

            {/* 2등, 3등 표시 */}
            {runners.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex flex-col gap-2">
                  {runners.map((runner, index) => (
                    <div
                      key={runner.userId}
                      className="flex items-center justify-between bg-black/10 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Icon name="medal" className={`w-4 h-4 ${index === 0 ? 'text-gray-300' : 'text-amber-900'}`} />
                        <span className="text-white/80 text-sm">{index + 2}등</span>
                        <span className="text-white font-medium">{runner.nickname}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/70">
                        <span>총 좋아요 {runner.totalVotes}</span>
                        <span>제출 의견 {runner.opinionCount}개</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
