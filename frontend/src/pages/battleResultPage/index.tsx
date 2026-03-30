import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '@/commons/components/Icon';
import WinnerSection from './components/WinnerSection';
import VoteChart from './components/VoteChartSector';
import MetricsCards from './components/MetricsCards';
import CodeViewerSection from './components/CodeViewerSection';
import TimelineSection from './components/TimelineSection';
import MvpCard from './components/MvpCard';
import { Trophy, Activity } from 'lucide-react';
import { useGetBattleResult } from './hooks/useGetBattleResult';

export default function BattleResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { battleResult: battleData } = useGetBattleResult(id!);

  const bestOpinion = useMemo(() => {
    if (!battleData?.mvps?.length || !battleData.timeline.length) return null;
    const topMvp = battleData.mvps[0];
    const mvpOpinions = battleData.timeline.filter((item) => item.author.id === topMvp.userId);
    if (!mvpOpinions.length) return null;
    return mvpOpinions.reduce((max, current) => (current.upvotes > max.upvotes ? current : max), mvpOpinions[0]);
  }, [battleData]);

  const { result } = battleData;

  const totalVotesWithoutNeutral = result.teamA.votes + result.teamB.votes;
  const teamAPercentageWithoutNeutral =
    totalVotesWithoutNeutral > 0 ? Math.round((result.teamA.votes / totalVotesWithoutNeutral) * 100) : 0;
  const teamBPercentageWithoutNeutral =
    totalVotesWithoutNeutral > 0 ? Math.round((result.teamB.votes / totalVotesWithoutNeutral) * 100) : 0;

  return (
    <div className="min-h-screen text-white p-6 md:p-10">
      <header className="text-center mb-10">
        <div className="flex justify-center items-center gap-2">
          <Icon name="trophy" />
          <h1 className="text-3xl md:text-4xl font-bold">배틀 결과</h1>
        </div>
        <p className="text-slate-400">배틀 종료! 최종 결과를 확인하세요</p>
      </header>

      <WinnerSection
        winner={result.winner}
        teamAPercentage={teamAPercentageWithoutNeutral}
        teamAVotes={result.teamA.votes}
        teamBPercentage={teamBPercentageWithoutNeutral}
        teamBVotes={result.teamB.votes}
      />

      <div className="max-w-7xl mx-auto mb-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VoteChart
          teamAPercentage={result.teamA.percentage}
          teamAVotes={result.teamA.votes}
          teamBPercentage={result.teamB.percentage}
          teamBVotes={result.teamB.votes}
          neutralPercentage={result.neutral.percentage}
          neutralVotes={result.neutral.votes}
        />
        {battleData.mvps.length > 0 ? (
          <MvpCard mvpList={battleData.mvps} bestOpinion={bestOpinion} />
        ) : (
          <MetricsCards
            totalParticipants={battleData.metrics.totalParticipants}
            totalViews={battleData.metrics.totalViews}
            strategiesCount={battleData.metrics.strategiesCount}
          />
        )}
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
          onClick={() => navigate('/main')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 rounded-lg font-bold text-white transition-all shadow-lg shadow-pink-500/30"
        >
          <Trophy className="w-5 h-5" />
          다른 배틀 보기
        </button>
        <button
          onClick={() => navigate('/main')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg font-bold text-white transition-all shadow-lg shadow-green-500/30"
        >
          <Activity className="w-5 h-5" />
          배틀 다시 시작하기
        </button>
      </div>
    </div>
  );
}
