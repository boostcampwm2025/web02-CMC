import Icon from '@/commons/components/Icon';
import type { IconName } from '@/commons/components/Icon';
import type { BattlePhase } from '@/commons/types/battle';

interface Step1BattleInfoProps {
  title: string;
  description: string;
  category: string;
  language: string;
  currentRound: number;
  totalRounds: number;
  topics: string[];
  totalParticipants: number;
  currentPhase?: BattlePhase;
  phaseCount?: number;
}

// Phase별 한글 레이블, 색상, 아이콘 매핑
const PHASE_CONFIG: Record<
  BattlePhase,
  { label: string; color: string; bgColor: string; borderColor: string; icon: IconName }
> = {
  PENDING: {
    label: '대기 중',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    borderColor: 'border-gray-500/50',
    icon: 'clock'
  },
  OPINION_SHARE: {
    label: '의견 공유',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/50',
    icon: 'message'
  },
  ATTACK: {
    label: '이의제기',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/50',
    icon: 'battle'
  },
  DEFENSE: {
    label: '반박',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
    icon: 'shield'
  },
  TEAM_SWITCH: {
    label: '진영 변경',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/50',
    icon: 'shuffle'
  }
};

export default function Step1BattleInfo({
  title,
  description,
  category,
  language,
  currentRound,
  totalRounds,
  topics,
  totalParticipants,
  currentPhase,
  phaseCount
}: Step1BattleInfoProps) {
  const phaseConfig = currentPhase ? PHASE_CONFIG[currentPhase] : null;
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-6xl mx-auto px-4">
      {/* 상단 섹션 */}
      <div className="text-center mb-4">
        <Icon name="trendingUp" className="battle-info-icon-size text-orange-500 mx-auto mb-2" />
        <h2 className="battle-info-title-size font-bold text-white mb-1">상황 요약</h2>
        <p className="battle-info-desc-size text-gray-400">현재 배틀 진행 현황을 확인하세요</p>
      </div>

      {/* 중앙 컨테이너 - 모든 카드를 감싸는 영역 */}
      <div className="w-full bg-[#0d0d1a]/50 rounded-lg border border-[#1a1a2e] battle-info-card-padding">
        {/* 배틀 정보 카드 */}
        <div className="bg-[#16162a] rounded-lg battle-info-card-padding border border-[#2d2d3f] mb-4 shadow-lg w-full">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="battle" className="battle-info-swords-size text-orange-500 flex-shrink-0" />
            <h3 className="text-white battle-info-title-size font-bold break-words min-w-0 text-left">{title}</h3>
          </div>
          <p className="text-gray-400 battle-info-desc-size mb-4 text-left break-words">{description}</p>
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">카테고리</span>
              <span className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg border border-orange-500/50 text-sm font-medium">
                {category}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">언어</span>
              <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/50 text-sm font-medium">
                {language}
              </span>
            </div>
          </div>
        </div>

        {/* 2열 그리드 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* 참여자 카드 */}
          <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/10 rounded-lg battle-info-card-padding border border-orange-500/30 shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="battle-info-stat-icon-size bg-orange-500/20 rounded-lg flex items-center justify-center border border-orange-500/40">
                <Icon name="peoples" className="battle-info-users-size text-orange-400" />
              </div>
              <div>
                <div className="text-orange-300/70 font-medium text-xs mb-1">총 참여자</div>
                <div className="battle-info-stat-value-size font-bold text-white">{totalParticipants}명</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-orange-400 text-sm">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span>실시간 배틀 진행 중</span>
            </div>
          </div>

          {/* 라운드 카드 */}
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 rounded-lg battle-info-card-padding border border-blue-500/30 shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                <Icon name="target" className="battle-info-target-size text-white" />
              </div>
              <div className="flex-1">
                <p className="text-gray-400 text-xs mb-1 text-left">진행 단계</p>
                <p className="text-white battle-info-stat-value-size font-bold mb-1.5 text-left">
                  라운드 {currentPhase === 'PENDING' ? 0 : currentRound} / {totalRounds}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {currentPhase !== 'PENDING' && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 text-orange-400 bg-orange-500/20 border-orange-500/50">
                        {topics[currentRound - 1]}
                      </div>
                    </div>
                  )}

                  {phaseConfig && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <div
                        className={`px-3 py-1 ${phaseConfig.bgColor} border ${phaseConfig.borderColor} rounded-lg flex items-center gap-1.5`}
                      >
                        <Icon name={phaseConfig.icon} className={`w-4 h-4 ${phaseConfig.color}`} />
                        <span className={`${phaseConfig.color} text-sm font-bold`}>
                          {phaseConfig.label}
                          {(currentPhase === 'ATTACK' || currentPhase === 'DEFENSE') && phaseCount && (
                            <span className="ml-1.5 text-xs opacity-80">{phaseCount === 1 ? '1차' : '2차'}</span>
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-2.5 rounded-full transition-all duration-500"
                style={{
                  width: `${currentPhase === 'PENDING' ? 0 : (currentRound / totalRounds) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
