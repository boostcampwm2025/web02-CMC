import Icon from '@/commons/components/Icon';

interface MetricsCardsProps {
  totalParticipants: number;
  totalViews: number;
  strategiesCount: number;
}

export default function MetricsCards({ totalParticipants, totalViews, strategiesCount }: MetricsCardsProps) {
  return (
    <div className="flex flex-col gap-6 h-full">
      {/* 총 참여자 카드 */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 flex-1 flex flex-col justify-center relative overflow-hidden border border-white/10">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-4">
            <span className="text-sm opacity-90 bg-white/20 px-3 py-1 rounded-full">총 참여자</span>
            <div className="text-5xl font-extrabold mb-2">{totalParticipants}</div>
          </div>
          <div className="bg-white/20 p-3 rounded-2xl">
            <Icon name="peoples" className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* 배틀 조회수 카드 */}
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-8 flex-1 flex flex-col justify-center relative overflow-hidden border border-white/10">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-4">
            <span className="text-sm opacity-90 bg-white/20 px-3 py-1 rounded-full">총 대화 횟 수</span>
            <div className="text-5xl font-extrabold mb-2">{totalViews.toLocaleString()}</div>
          </div>
          <div className="bg-white/20 p-3 rounded-2xl">
            <Icon name="eye" className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* 작전 전략 카드 */}
      <div className="bg-gradient-to-br from-lime-500 to-yellow-500 rounded-2xl p-8 flex-1 flex flex-col justify-center relative overflow-hidden border border-white/10">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-4">
            <span className="text-sm opacity-90 bg-white/20 px-3 py-1 rounded-full">이의제기 횟 수</span>
            <div className="text-5xl font-extrabold mb-2">{strategiesCount}</div>
          </div>
          <div className="bg-white/20 p-3 rounded-2xl">
            <Icon name="message" className="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
