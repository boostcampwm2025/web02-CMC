import { TrendingUp, Swords, Users, Target } from 'lucide-react';
import type { BattlePhase } from '@/commons/types/battle';

interface Step1BattleInfoProps {
  title: string;
  description: string;
  category: string;
  language: string;
  currentRound: number;
  totalRounds: number;
  totalParticipants: number;
  currentPhase?: BattlePhase;
}

// Phase별 한글 레이블과 색상 매핑
const PHASE_CONFIG = {
  OPINION_SHARE: {
    label: '의견 공유',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/50'
  },
  TEAM_A_ATTACK: {
    label: '이의제기',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/50'
  },
  TEAM_B_ATTACK: {
    label: '이의제기',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/50'
  },
  TEAM_SWITCH: {
    label: '진영 변경',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/50'
  }
} as const;

export default function Step1BattleInfo({
  title,
  description,
  category,
  language,
  currentRound,
  totalRounds,
  totalParticipants,
  currentPhase
}: Step1BattleInfoProps) {
  const phaseConfig = currentPhase ? PHASE_CONFIG[currentPhase] : null;
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-6xl mx-auto">
      {/* 상단 섹션 */}
      <div className="text-center mb-8">
        <TrendingUp className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">상황 요약</h2>
        <p className="text-gray-400">현재 배틀 진행 현황을 확인하세요</p>
      </div>

      {/* 중앙 컨테이너 - 모든 카드를 감싸는 영역 */}
      <div className="w-full bg-[#0d0d1a]/50 rounded-2xl p-8 border border-[#1a1a2e]">
        {/* 배틀 정보 카드 */}
        <div className="bg-[#16162a] rounded-xl p-8 border border-[#2d2d3f] mb-6 shadow-lg w-full">
          <div className="flex items-center gap-3 mb-4">
            <Swords className="w-6 h-6 text-orange-500" />
            <h3 className="text-white text-2xl font-bold">{title}</h3>
          </div>
          <p className="text-gray-400 mb-6 text-left">{description}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* 참여자 카드 */}
          <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/10 rounded-xl p-8 border border-orange-500/30 shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/40">
                <Users className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-1">{totalParticipants}명</div>
                <div className="text-orange-300/70 font-medium">참여자</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-orange-400 text-sm">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span>실시간 배틀 진행 중</span>
            </div>
          </div>

          {/* 라운드 카드 */}
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 rounded-xl p-8 border border-blue-500/30 shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/40">
                <Target className="w-8 h-8 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-4xl font-bold text-white mb-1">
                  라운드 {currentRound} / {totalRounds}
                </div>
                <div className="text-blue-300/70 font-medium">진행 단계</div>
              </div>
            </div>
            {phaseConfig && (
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${phaseConfig.bgColor} ${phaseConfig.borderColor} border mb-4`}
              >
                <div className={`w-2 h-2 rounded-full ${phaseConfig.color.replace('text-', 'bg-')} animate-pulse`} />
                <span className={`text-sm font-semibold ${phaseConfig.color}`}>{phaseConfig.label} 진행 중</span>
              </div>
            )}
            <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden border border-blue-500/20">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(currentRound / totalRounds) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
