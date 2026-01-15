import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, ThumbsUp, Zap, Shield, Flame, ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import type { BattleDiscussion, BattleDefense } from '@/commons/types/battle';

interface Step3TimelineProps {
  timelines: Array<BattleDiscussion | BattleDefense>;
  topics: string[];
  currentRound?: number;
  totalRounds?: number;
}

interface RoundData {
  round: number;
  topic: string;
  isActive: boolean;
  isFuture: boolean;
  challenge: {
    teamA: BattleDiscussion | null;
    teamB: BattleDiscussion | null;
  };
  rebuttal: {
    teamA: BattleDefense | null;
    teamB: BattleDefense | null;
  };
}

export default function Step3Timeline({ topics, timelines, currentRound = 1, totalRounds = 2 }: Step3TimelineProps) {
  const [expandedRounds, setExpandedRounds] = useState<Set<number>>(new Set([currentRound]));

  // useRef는 초기화 시에만 호출되므로 Date.now()는 마운트 시 한 번만 실행됨
  const nowRef = useRef<number>(0);

  useEffect(() => {
    if (nowRef.current === 0) {
      nowRef.current = Date.now();
    }
  }, []);

  const now = nowRef.current;

  // 라운드별로 메시지 그룹화
  const organizeByRounds = (): RoundData[] => {
    const rounds: RoundData[] = [];

    // attacks와 defenses 분리
    const attacks = timelines.filter((item) => item.type === 'ATTACK') as BattleDiscussion[];
    const defenses = timelines.filter((item) => item.type === 'DEFENSE') as BattleDefense[];

    for (let i = 1; i <= totalRounds; i++) {
      // 각 라운드는 A팀, B팀 순서로 2개씩 저장됨
      const aAttackIdx = (i - 1) * 2;
      const bAttackIdx = (i - 1) * 2 + 1;
      const aDefenseIdx = (i - 1) * 2;
      const bDefenseIdx = (i - 1) * 2 + 1;

      const challengeA = attacks[aAttackIdx] || null;
      const challengeB = attacks[bAttackIdx] || null;
      const rebuttalA = (defenses[aDefenseIdx] as BattleDefense) || null;
      const rebuttalB = (defenses[bDefenseIdx] as BattleDefense) || null;

      rounds.push({
        round: i,
        topic: topics[i - 1],
        isActive: i === currentRound,
        isFuture: i > currentRound,
        challenge: {
          teamA: challengeA,
          teamB: challengeB
        },
        rebuttal: {
          teamA: rebuttalA,
          teamB: rebuttalB
        }
      });
    }

    return rounds;
  };

  const roundsData = organizeByRounds();

  const toggleRound = (round: number) => {
    const newExpanded = new Set(expandedRounds);
    if (newExpanded.has(round)) {
      newExpanded.delete(round);
    } else {
      newExpanded.add(round);
    }
    setExpandedRounds(newExpanded);
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '알 수 없음';

    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    return `${Math.floor(minutes / 60)}시간 전`;
  };

  const renderMessage = (
    message: BattleDiscussion | BattleDefense | null,
    team: 'A' | 'B',
    type: 'challenge' | 'rebuttal'
  ) => {
    if (!message) {
      return (
        <div className="p-4 text-center">
          <div className="text-gray-600 text-sm">
            {type === 'challenge' ? '이의제기 대기 중...' : '반론 대기 중...'}
          </div>
        </div>
      );
    }

    const isTeamA = team === 'A';

    return (
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded text-xs font-bold ${
                isTeamA ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
              }`}
            >
              {isTeamA ? 'A팀' : 'B팀'}
            </span>
            <span className="text-white font-medium text-sm">
              {message.authorId ? `User-${message.authorId.slice(0, 6)}` : '익명'}
            </span>
          </div>
          <span className="text-gray-500 text-xs">{formatTime(message.selectedAt)}</span>
        </div>

        {/* Content */}
        <p className="text-gray-300 mb-4 leading-relaxed text-sm">{message.content}</p>

        {/* Vote Display */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 w-fit ${
            isTeamA ? 'bg-blue-600/20 border-blue-500/30' : 'bg-red-600/20 border-red-500/30'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${isTeamA ? 'text-blue-400' : 'text-red-400'}`} />
          <span className={`font-bold ${isTeamA ? 'text-blue-300' : 'text-red-300'}`}>{message.upvotes}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-6xl mx-auto">
      {/* 상단 섹션 */}
      <div className="text-center mb-8">
        <Clock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">타임라인</h2>
        <p className="text-gray-400">양측의 이의제기와 반박을 확인해보세요</p>
      </div>

      {/* 중앙 컨테이너 */}
      <div className="w-full bg-[#0d0d1a]/50 rounded-2xl p-8 border border-[#1a1a2e]">
        {timelines.length === 0 ? (
          <div className="bg-[#1e1e2f] rounded-xl border border-[#2d2d3f] p-8">
            <div className="text-center text-gray-400">
              <Flame className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-lg font-medium mb-1">아직 이의제기가 없습니다</p>
              <p className="text-sm">배틀이 시작되면 여기에 표시됩니다</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {roundsData.map((roundData) => {
              const isExpanded = expandedRounds.has(roundData.round);
              const hasContent =
                roundData.challenge.teamA ||
                roundData.challenge.teamB ||
                roundData.rebuttal.teamA ||
                roundData.rebuttal.teamB;

              return (
                <div
                  key={roundData.round}
                  className={`bg-[#1a1a2e] rounded-xl border-2 overflow-hidden transition-all ${
                    roundData.isActive
                      ? 'border-orange-500/50 shadow-lg shadow-orange-500/20'
                      : roundData.isFuture
                        ? 'border-gray-700/30 opacity-50'
                        : 'border-[#2d2d3f]'
                  }`}
                >
                  {/* Round Header */}
                  <button
                    onClick={() => toggleRound(roundData.round)}
                    disabled={roundData.isFuture}
                    className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[#16162a] to-[#1a1a2e] hover:from-[#1a1a2e] hover:to-[#1e1e2f] transition-all disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      {/* Round Badge */}
                      <div
                        className={`px-4 py-2 rounded-lg font-bold ${
                          roundData.isActive
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                            : roundData.isFuture
                              ? 'bg-gray-700/30 text-gray-600'
                              : 'bg-gray-700/50 text-gray-400'
                        }`}
                      >
                        Round {roundData.round}
                      </div>
                      <div
                        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                          roundData.isActive
                            ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-md shadow-purple-400/20'
                            : roundData.isFuture
                              ? 'bg-gray-700/20 text-gray-500'
                              : 'bg-gray-700/40 text-gray-400'
                        }`}
                      >
                        {roundData.topic}
                      </div>

                      {/* Status Indicator */}
                      {roundData.isActive && (
                        <div className="flex items-center gap-2 text-orange-400">
                          <Flame className="w-5 h-5 animate-pulse" />
                          <span className="text-sm font-bold">진행 중</span>
                        </div>
                      )}

                      {!roundData.isFuture && !roundData.isActive && hasContent && (
                        <div className="text-sm text-gray-500">완료</div>
                      )}

                      {roundData.isFuture && <div className="text-sm text-gray-600">대기 중</div>}
                    </div>

                    {/* Expand Icon */}
                    {!roundData.isFuture && (
                      <div className="text-gray-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    )}
                  </button>

                  {/* Round Content */}
                  {isExpanded && !roundData.isFuture && (
                    <div className="border-t border-[#2d2d3f]">
                      {/* Challenge Phase: A 이의제기 → B 반론 */}
                      <div className="relative">
                        {/* Phase Header */}
                        <div className="px-6 py-3 bg-gradient-to-r from-orange-900/20 to-blue-900/20 border-b border-[#2d2d3f]">
                          <div className="flex items-center justify-center gap-3">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-orange-400" />
                              <span className="text-orange-400 font-bold text-xs uppercase tracking-wider">
                                A 이의제기
                              </span>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-500" />
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-blue-400" />
                              <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">B 반론</span>
                            </div>
                          </div>
                        </div>

                        {/* VS Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
                          {/* Team A Challenge */}
                          <div className="border-r border-[#2d2d3f] bg-gradient-to-r from-orange-500/5 to-transparent">
                            {renderMessage(roundData.challenge.teamA, 'A', 'challenge')}
                          </div>

                          {/* Arrow Badge */}
                          <div className="hidden md:flex items-center justify-center px-4 bg-[#0a0a1a] border-r border-[#2d2d3f]">
                            <div className="relative">
                              <div className="absolute inset-0 bg-orange-500/20 blur-lg rounded-full" />
                              <div className="relative bg-gradient-to-r from-orange-500 to-blue-600 w-12 h-12 rounded-full flex items-center justify-center border-2 border-orange-400/50 shadow-lg">
                                <ArrowRight className="w-5 h-5 text-white font-bold" />
                              </div>
                            </div>
                          </div>

                          {/* Team B Rebuttal */}
                          <div className="bg-gradient-to-l from-blue-500/5 to-transparent border-t md:border-t-0 border-[#2d2d3f]">
                            {renderMessage(roundData.rebuttal.teamB, 'B', 'rebuttal')}
                          </div>
                        </div>
                      </div>

                      {/* Rebuttal Phase: B 이의제기 → A 반론 */}
                      <div className="relative border-t-2 border-[#2d2d3f]">
                        {/* Phase Header */}
                        <div className="px-6 py-3 bg-gradient-to-r from-blue-900/20 to-red-900/20 border-b border-[#2d2d3f]">
                          <div className="flex items-center justify-center gap-3">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-blue-400" />
                              <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">A 반론</span>
                            </div>
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-red-400" />
                              <span className="text-red-400 font-bold text-xs uppercase tracking-wider">
                                B 이의제기
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* VS Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
                          {/* Team A Rebuttal */}
                          <div className="border-r border-[#2d2d3f] bg-gradient-to-r from-blue-500/5 to-transparent">
                            {renderMessage(roundData.rebuttal.teamA, 'A', 'rebuttal')}
                          </div>

                          {/* Arrow Badge */}
                          <div className="hidden md:flex items-center justify-center px-4 bg-[#0a0a1a] border-r border-[#2d2d3f]">
                            <div className="relative">
                              <div className="absolute inset-0 bg-red-500/20 blur-lg rounded-full" />
                              <div className="relative bg-gradient-to-l from-red-500 to-blue-600 w-12 h-12 rounded-full flex items-center justify-center border-2 border-red-400/50 shadow-lg">
                                <ArrowLeft className="w-5 h-5 text-white font-bold" />
                              </div>
                            </div>
                          </div>

                          {/* Team B Challenge */}
                          <div className="bg-gradient-to-l from-red-500/5 to-transparent border-t md:border-t-0 border-[#2d2d3f]">
                            {renderMessage(roundData.challenge.teamB, 'B', 'challenge')}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
