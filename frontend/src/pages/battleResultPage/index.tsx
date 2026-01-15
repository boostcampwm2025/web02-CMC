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
import type { BattleResultApiResponse } from './types';

export default function BattleResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [battleData, setBattleData] = useState<BattleResultApiResponse | null>(null);

  useEffect(() => {
    // TODO: API 호출로 실제 데이터 가져오기
    // 임시 목 데이터
    setBattleData({
      battleId: id || '1',
      author: 'user123',
      title: '운동복 서자',
      description: '빠른 호흡 최종 결과를 축하합니다',
      aCode: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
      bCode: `function fibonacci(n) {
  const dp = [0, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}`,
      language: 'JS',
      type: 'NORMAL',
      status: 'CLOSED',
      category: 'ALGORITHM',
      playTime: '30',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      finishedAt: new Date().toISOString(),
      result: {
        winner: 'A',
        teamA: { votes: 60, percentage: 50 },
        teamB: { votes: 56, percentage: 47 },
        neutral: { votes: 2, percentage: 3 }
      },
      metrics: {
        totalParticipants: 118,
        totalViews: 1247,
        strategiesCount: 12
      },
      voteTimeline: [
        {
          turn: 1,
          teamAVotes: 30,
          teamBVotes: 28,
          neutralVotes: 60,
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          turn: 2,
          teamAVotes: 60,
          teamBVotes: 56,
          neutralVotes: 2,
          timestamp: new Date().toISOString()
        }
      ],
      timeline: [
        {
          id: '1',
          type: 'ATTACK',
          author: { id: 'user1', nickname: '개발자A' },
          team: 'A',
          content: '코드 B는 메모리를 너무 많이 사용합니다.',
          turn: 1,
          upvotes: 15,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          type: 'ATTACK',
          author: { id: 'user2', nickname: '개발자B' },
          team: 'B',
          content: '시간 복잡도 측면에서 훨씬 효율적입니다.',
          turn: 1,
          upvotes: 20,
          createdAt: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: '3',
          type: 'DEFENSE',
          author: { id: 'user1', nickname: '개발자A' },
          team: 'B',
          content: '코드 B는 메모리를 너무 많이 사용합니다.',
          turn: 1,
          upvotes: 15,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '4',
          type: 'DEFENSE',
          author: { id: 'user2', nickname: '개발자B' },
          team: 'A',
          content: '시간 복잡도 측면에서 훨씬 효율적입니다.',
          turn: 1,
          upvotes: 20,
          createdAt: new Date(Date.now() - 1800000).toISOString()
        }
      ],
      topics: ['메모리 효율성', '시간 복잡도']
    });
  }, [id]);

  if (!battleData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-2xl">로딩 중...</div>
    );
  }

  const { result } = battleData;

  // 타임라인 데이터 변환
  const convertedTimeline = battleData.timeline.map((item) => ({
    discussionId: item.id,
    authorId: item.author.id,
    type: item.type,
    content: item.content,
    upvotes: item.upvotes,
    votes: [],
    status: 'SELECTED' as const,
    selectedAt: new Date(item.createdAt).getTime(),
    team: item.team,
    ...(item.type === 'DEFENSE' && { attackId: '' })
  }));

  // 라운드별로 데이터 구성
  const roundsData = organizeByRounds({
    timelines: convertedTimeline,
    topics: battleData.topics,
    currentRound: 0,
    totalRounds: 2
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
