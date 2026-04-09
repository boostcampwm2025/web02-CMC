import { useState } from 'react';
import Icon from '@/commons/components/Icon';
import type { BattleDiscussion, BattleDefense, BattleInfo } from '@/commons/types/battle';
import { organizeByRounds } from '@/pages/teamSelectPage/utils/organizeByRounds';
import MessageCard from './MessageCard';

interface TimelineProps {
  battleInfo: BattleInfo;
}

export default function Timeline({ battleInfo }: TimelineProps) {
  const { topics, currentRound, totalRounds } = battleInfo;
  const timelines: Array<BattleDiscussion | BattleDefense> = [
    ...battleInfo.timelines.attacks,
    ...battleInfo.timelines.defenses
  ];
  const [expandedRounds, setExpandedRounds] = useState<Set<number>>(new Set([currentRound]));

  const roundsData = organizeByRounds({ timelines, topics, currentRound, totalRounds });

  const toggleRound = (round: number) => {
    const newExpanded = new Set(expandedRounds);
    if (newExpanded.has(round)) {
      newExpanded.delete(round);
    } else {
      newExpanded.add(round);
    }
    setExpandedRounds(newExpanded);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-6xl mx-auto">
      {/* 상단 섹션 */}
      <div className="text-center mb-8">
        <Icon name="clock" className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">타임라인</h2>
        <p className="text-gray-400">양측의 이의제기와 반박을 확인해보세요</p>
      </div>

      {/* 중앙 컨테이너 */}
      <div className="w-full bg-[#0d0d1a]/50 rounded-2xl p-8 border border-[#1a1a2e]">
        {timelines.length === 0 ? (
          <div className="bg-[#1e1e2f] rounded-xl border border-[#2d2d3f] p-8">
            <div className="text-center text-gray-400">
              <Icon name="flame" className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-lg font-medium mb-1">아직 이의제기가 없습니다</p>
              <p className="text-sm">배틀이 시작되면 여기에 표시됩니다</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {roundsData.map((roundData) => {
              const isExpanded = expandedRounds.has(roundData.round);
              const hasContent =
                roundData.challenge1.teamA ||
                roundData.challenge1.teamB ||
                roundData.challenge2.teamA ||
                roundData.challenge2.teamB ||
                roundData.challenge3.teamA ||
                roundData.challenge3.teamB ||
                roundData.challenge4.teamA ||
                roundData.challenge4.teamB;

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
                          <Icon name="flame" className="w-5 h-5 animate-pulse" />
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
                        {isExpanded ? (
                          <Icon name="chevronUp" className="w-5 h-5" />
                        ) : (
                          <Icon name="chevronDown" className="w-5 h-5" />
                        )}
                      </div>
                    )}
                  </button>

                  {/* Round Content */}
                  {isExpanded && !roundData.isFuture && (
                    <div className="border-t border-[#2d2d3f]">
                      {/* Challenge 1: A 이의제기 → B 반론 (1차) */}
                      <div className="relative">
                        <div className="px-6 py-3 bg-gradient-to-r from-orange-900/20 to-blue-900/20 border-b border-[#2d2d3f]">
                          <div className="flex items-center justify-center gap-3">
                            <div className="flex items-center gap-2">
                              <Icon name="zap" className="w-4 h-4 text-orange-400" />
                              <span className="text-orange-400 font-bold text-xs uppercase tracking-wider">
                                A 이의제기 (1차)
                              </span>
                            </div>
                            <Icon name="arrowRight" className="w-5 h-5 text-gray-500" />
                            <div className="flex items-center gap-2">
                              <Icon name="shield" className="w-4 h-4 text-blue-400" />
                              <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">B 반론</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
                          <div className="border-r border-[#2d2d3f] bg-gradient-to-r from-orange-500/5 to-transparent">
                            <MessageCard message={roundData.challenge1.teamA} team="A" type="challenge" />
                          </div>
                          <div className="hidden md:flex items-center justify-center px-4 bg-[#0a0a1a] border-r border-[#2d2d3f]">
                            <div className="relative">
                              <div className="absolute inset-0 bg-orange-500/20 blur-lg rounded-full" />
                              <div className="relative bg-gradient-to-r from-orange-500 to-blue-600 w-12 h-12 rounded-full flex items-center justify-center border-2 border-orange-400/50 shadow-lg">
                                <Icon name="arrowRight" className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          </div>
                          <div className="bg-gradient-to-l from-blue-500/5 to-transparent border-t md:border-t-0 border-[#2d2d3f]">
                            <MessageCard message={roundData.challenge1.teamB} team="B" type="rebuttal" />
                          </div>
                        </div>
                      </div>

                      {/* Challenge 2: B 이의제기 → A 반론 (1차) */}
                      <div className="relative border-t-2 border-[#2d2d3f]">
                        <div className="px-6 py-3 bg-gradient-to-r from-red-900/20 to-blue-900/20 border-b border-[#2d2d3f]">
                          <div className="flex items-center justify-center gap-3">
                            <div className="flex items-center gap-2">
                              <Icon name="zap" className="w-4 h-4 text-red-400" />
                              <span className="text-red-400 font-bold text-xs uppercase tracking-wider">
                                B 이의제기 (1차)
                              </span>
                            </div>
                            <Icon name="arrowRight" className="w-5 h-5 text-gray-500" />
                            <div className="flex items-center gap-2">
                              <Icon name="shield" className="w-4 h-4 text-blue-400" />
                              <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">A 반론</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
                          <div className="border-r border-[#2d2d3f] bg-gradient-to-r from-red-500/5 to-transparent">
                            <MessageCard message={roundData.challenge2.teamB} team="B" type="challenge" />
                          </div>
                          <div className="hidden md:flex items-center justify-center px-4 bg-[#0a0a1a] border-r border-[#2d2d3f]">
                            <div className="relative">
                              <div className="absolute inset-0 bg-red-500/20 blur-lg rounded-full" />
                              <div className="relative bg-gradient-to-r from-red-500 to-blue-600 w-12 h-12 rounded-full flex items-center justify-center border-2 border-red-400/50 shadow-lg">
                                <Icon name="arrowRight" className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          </div>
                          <div className="bg-gradient-to-l from-blue-500/5 to-transparent border-t md:border-t-0 border-[#2d2d3f]">
                            <MessageCard message={roundData.challenge2.teamA} team="A" type="rebuttal" />
                          </div>
                        </div>
                      </div>

                      {/* Challenge 3: A 이의제기 → B 반론 (2차) */}
                      <div className="relative border-t-2 border-[#2d2d3f]">
                        <div className="px-6 py-3 bg-gradient-to-r from-orange-900/20 to-blue-900/20 border-b border-[#2d2d3f]">
                          <div className="flex items-center justify-center gap-3">
                            <div className="flex items-center gap-2">
                              <Icon name="zap" className="w-4 h-4 text-orange-400" />
                              <span className="text-orange-400 font-bold text-xs uppercase tracking-wider">
                                A 이의제기 (2차)
                              </span>
                            </div>
                            <Icon name="arrowRight" className="w-5 h-5 text-gray-500" />
                            <div className="flex items-center gap-2">
                              <Icon name="shield" className="w-4 h-4 text-blue-400" />
                              <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">B 반론</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
                          <div className="border-r border-[#2d2d3f] bg-gradient-to-r from-orange-500/5 to-transparent">
                            <MessageCard message={roundData.challenge3.teamA} team="A" type="challenge" />
                          </div>
                          <div className="hidden md:flex items-center justify-center px-4 bg-[#0a0a1a] border-r border-[#2d2d3f]">
                            <div className="relative">
                              <div className="absolute inset-0 bg-orange-500/20 blur-lg rounded-full" />
                              <div className="relative bg-gradient-to-r from-orange-500 to-blue-600 w-12 h-12 rounded-full flex items-center justify-center border-2 border-orange-400/50 shadow-lg">
                                <Icon name="arrowRight" className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          </div>
                          <div className="bg-gradient-to-l from-blue-500/5 to-transparent border-t md:border-t-0 border-[#2d2d3f]">
                            <MessageCard message={roundData.challenge3.teamB} team="B" type="rebuttal" />
                          </div>
                        </div>
                      </div>

                      {/* Challenge 4: B 이의제기 → A 반론 (2차) */}
                      <div className="relative border-t-2 border-[#2d2d3f]">
                        <div className="px-6 py-3 bg-gradient-to-r from-red-900/20 to-blue-900/20 border-b border-[#2d2d3f]">
                          <div className="flex items-center justify-center gap-3">
                            <div className="flex items-center gap-2">
                              <Icon name="zap" className="w-4 h-4 text-red-400" />
                              <span className="text-red-400 font-bold text-xs uppercase tracking-wider">
                                B 이의제기 (2차)
                              </span>
                            </div>
                            <Icon name="arrowRight" className="w-5 h-5 text-gray-500" />
                            <div className="flex items-center gap-2">
                              <Icon name="shield" className="w-4 h-4 text-blue-400" />
                              <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">A 반론</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
                          <div className="border-r border-[#2d2d3f] bg-gradient-to-r from-red-500/5 to-transparent">
                            <MessageCard message={roundData.challenge4.teamB} team="B" type="challenge" />
                          </div>
                          <div className="hidden md:flex items-center justify-center px-4 bg-[#0a0a1a] border-r border-[#2d2d3f]">
                            <div className="relative">
                              <div className="absolute inset-0 bg-red-500/20 blur-lg rounded-full" />
                              <div className="relative bg-gradient-to-r from-red-500 to-blue-600 w-12 h-12 rounded-full flex items-center justify-center border-2 border-red-400/50 shadow-lg">
                                <Icon name="arrowRight" className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          </div>
                          <div className="bg-gradient-to-l from-blue-500/5 to-transparent border-t md:border-t-0 border-[#2d2d3f]">
                            <MessageCard message={roundData.challenge4.teamA} team="A" type="rebuttal" />
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
