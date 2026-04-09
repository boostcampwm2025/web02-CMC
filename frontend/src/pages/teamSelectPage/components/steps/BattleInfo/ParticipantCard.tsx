import Icon from '@/commons/components/Icon';

interface ParticipantCardProps {
  participantCount: number;
}

export default function ParticipantCard({ participantCount }: ParticipantCardProps) {
  return (
    <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/10 rounded-lg battle-info-card-padding border border-orange-500/30 shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="battle-info-stat-icon-size bg-orange-500/20 rounded-lg flex items-center justify-center border border-orange-500/40">
          <Icon name="peoples" className="battle-info-users-size text-orange-400" />
        </div>
        <div>
          <div className="text-orange-300/70 font-medium text-xs mb-1">총 참여자</div>
          <div className="battle-info-stat-value-size font-bold text-white">{participantCount}명</div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-orange-400 text-sm">
        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        <span>실시간 배틀 진행 중</span>
      </div>
    </div>
  );
}
