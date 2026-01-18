import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TrophyIcon from '@/assets/icon/trophy.svg?react';
import WinnerSection from './components/WinnerSection';
import VoteChart from './components/VoteChartSector';
import MetricsCards from './components/MetricsCards';
import CodeViewerSection from './components/CodeViewerSection';
import TimelineSection from './components/TimelineSection';
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
    return <div>로딩 중...</div>;
  }

  const { result } = battleData;

  return (
    <div className="min-h-screen text-white p-6 md:p-10">
      <header className="text-center mb-10">
        <div className="flex justify-center items-center gap-2">
          <TrophyIcon />
          <h1 className="text-3xl md:text-4xl font-bold">배틀 결과</h1>
        </div>
        <p className="text-slate-400">배틀 종료! 최종 결과를 확인하세요</p>
      </header>

      <WinnerSection
        winner={result.winner}
        teamAPercentage={result.teamA.percentage}
        teamAVotes={result.teamA.votes}
        teamBPercentage={result.teamB.percentage}
        teamBVotes={result.teamB.votes}
      />

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

      <CodeViewerSection
        codeA={battleData.codeA}
        codeB={battleData.codeB}
        language={battleData.language}
        winner={result.winner}
      />

      <TimelineSection timelines={battleData.timeline} topics={battleData.topics} />

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
