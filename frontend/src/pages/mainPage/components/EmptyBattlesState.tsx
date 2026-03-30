import Icon from '@/commons/components/Icon';

interface EmptyBattlesStateProps {
  type: 'live' | 'past';
  height?: string;
}

export default function EmptyBattlesState({ type, height = '18rem' }: EmptyBattlesStateProps) {
  const isLive = type === 'live';

  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-[#2b2b3e] bg-[#121226]/50 backdrop-blur-sm"
      style={{ height }}
    >
      <div className="relative">
        <div
          className={`h-20 w-20 rounded-full bg-gradient-to-br ${isLive ? 'from-orange-500/20 to-orange-600/20' : 'from-gray-500/20 to-gray-600/20'} flex items-center justify-center`}
        >
          {isLive ? (
            <Icon name="battle" className="w-10 h-10 text-orange-500" />
          ) : (
            <Icon name="clock" className="w-10 h-10 text-gray-500" />
          )}
        </div>
        {isLive && <div className="absolute inset-0 h-20 w-20 rounded-full bg-orange-500/30 animate-ping"></div>}
      </div>

      <div className="flex flex-col items-center gap-2">
        <h3 className="text-xl font-bold text-gray-300">
          {isLive ? '진행 중인 배틀이 없습니다' : '종료된 배틀이 없습니다'}
        </h3>
        <p className="text-sm text-gray-500">
          {isLive ? '새로운 배틀을 만들어보세요!' : '배틀이 종료되면 여기에 표시됩니다'}
        </p>
      </div>

      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div
          className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${isLive ? 'from-orange-500/10' : 'from-gray-500/10'} to-transparent blur-3xl`}
        ></div>
        <div
          className={`absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr ${isLive ? 'from-orange-500/10' : 'from-gray-500/10'} to-transparent blur-3xl`}
        ></div>
      </div>
    </div>
  );
}
