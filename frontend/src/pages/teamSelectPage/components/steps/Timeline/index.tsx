import { useState } from 'react';
import Icon from '@/commons/components/Icon';
import type { BattleDiscussion, BattleDefense, BattleInfo } from '@/commons/types/battle';
import { organizeByRounds } from '@/pages/teamSelectPage/utils/organizeByRounds';
import ChallengeRow from './ChallengeRow';

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
                      <ChallengeRow
                        attackTeam="A"
                        phase={1}
                        challengeMessage={roundData.challenge1.teamA}
                        rebuttalMessage={roundData.challenge1.teamB}
                        isFirst
                      />
                      <ChallengeRow
                        attackTeam="B"
                        phase={1}
                        challengeMessage={roundData.challenge2.teamB}
                        rebuttalMessage={roundData.challenge2.teamA}
                      />
                      <ChallengeRow
                        attackTeam="A"
                        phase={2}
                        challengeMessage={roundData.challenge3.teamA}
                        rebuttalMessage={roundData.challenge3.teamB}
                      />
                      <ChallengeRow
                        attackTeam="B"
                        phase={2}
                        challengeMessage={roundData.challenge4.teamB}
                        rebuttalMessage={roundData.challenge4.teamA}
                      />
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
