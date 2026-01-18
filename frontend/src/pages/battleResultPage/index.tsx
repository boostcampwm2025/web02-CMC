import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TrophyIcon from '@/assets/icon/trophy.svg?react';
import WinnerSection from './components/WinnerSection';
import VoteChart from './components/VoteChartSector';
import MetricsCards from './components/MetricsCards';
import CodeViewerSection from './components/CodeViewerSection';
import { getTimeAgo } from '@/commons/utils/getTimeAgo';
import RoundCard from '@/commons/components/timeline/RoundCard';
import { organizeByRounds } from '@/commons/utils/organizeByRounds';
import { Trophy, Activity } from 'lucide-react';
import { getBattleResult } from './apis/getBattleResult';
import type { BattleResultApiResponse } from './types';

export default function BattleResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [battleData, setBattleData] = useState<BattleResultApiResponse | null>(null);

  useEffect(() => {
    const fetchBattleResult = async () => {
      if (!id) return;

      const data = await getBattleResult(id);
      setBattleData(data);
    };

    fetchBattleResult();
  }, [id]);

  if (!battleData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-2xl">로딩 중...</div>
    );
  }

  const { result } = battleData;

  const roundsData = organizeByRounds({
    timelines: battleData.timeline,
    topics: battleData.topics,
    currentRound: 0,
    totalRounds: battleData.timeline.length / 4
  }).map((round) => ({
    ...round,
    isActive: true,
    isFuture: false
  }));

  // 시간 포맷 함수
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '알 수 없음';
    return getTimeAgo(new Date(timestamp).toISOString());
  };

  return (
    <div className="min-h-screen text-white p-6 md:p-10">
      {/* 헤더 */}
      <header className="text-center mb-10">
        <div className="flex justify-center items-center gap-2">
          <TrophyIcon />
          <h1 className="text-3xl md:text-4xl font-bold">배틀 결과</h1>
        </div>
        <p className="text-slate-400">배틀 종료! 최종 결과를 확인하세요</p>
      </header>

      {/* 승자 섹션 */}
      <WinnerSection
        winner={result.winner}
        teamAPercentage={result.teamA.percentage}
        teamAVotes={result.teamA.votes}
        teamBPercentage={result.teamB.percentage}
        teamBVotes={result.teamB.votes}
      />

      {/* 투표 차트 & 통계 섹션 */}
      <div className="max-w-7xl mx-auto mb-12 flex gap-6 items-stretch">
        <div className="flex-1">
          <VoteChart
            teamAPercentage={result.teamA.percentage}
            teamAVotes={result.teamA.votes}
            teamBPercentage={result.teamB.percentage}
            teamBVotes={result.teamB.votes}
            neutralPercentage={result.neutral.percentage}
            neutralVotes={result.neutral.votes}
          />
        </div>
        <div className="flex-1">
          <MetricsCards
            totalParticipants={battleData.metrics.totalParticipants}
            totalViews={battleData.metrics.totalViews}
            strategiesCount={battleData.metrics.strategiesCount}
          />
        </div>
      </div>

      {/* 코드 섹션 */}
      <CodeViewerSection
        codeA={battleData.aCode}
        codeB={battleData.bCode}
        language={battleData.language}
        winner={result.winner}
      />

      {/* 타임라인 섹션 */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="w-full bg-[#0d0d1a]/50 rounded-2xl p-8 border border-[#1a1a2e]">
          <div className="flex gap-2 items-center mb-6">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <h2 className="text-2xl font-bold">배틀 타임라인</h2>
          </div>
          <div className="space-y-4">
            {roundsData.map((roundData) => (
              <RoundCard
                key={roundData.round}
                roundData={roundData}
                isExpanded={true}
                onToggle={() => {}}
                formatTime={formatTime}
                showStatus={false}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 하단 버튼 섹션 */}
      <div className="max-w-7xl mx-auto mb-12 flex gap-4 justify-center">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 rounded-lg font-bold text-white transition-all shadow-lg shadow-pink-500/30"
        >
          <Trophy className="w-5 h-5" />
          다른 배틀 보기
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg font-bold text-white transition-all shadow-lg shadow-green-500/30"
        >
          <Activity className="w-5 h-5" />
          배틀 다시 시작하기
        </button>
      </div>
    </div>
  );
}
