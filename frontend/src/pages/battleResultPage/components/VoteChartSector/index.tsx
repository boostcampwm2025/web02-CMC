import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { ChartData } from './chart.types';
import ChartLegend from './ChartLegend';

interface VoteChartProps {
  teamAPercentage: number;
  teamAVotes: number;
  teamBPercentage: number;
  teamBVotes: number;
  neutralPercentage: number;
  neutralVotes: number;
}

const COLORS = {
  TEAM_A: '#5B8DEE',
  TEAM_B: '#EE5B5B',
  NEUTRAL: '#6B7280'
} as const;

const CHART_CONFIG = {
  outerRadius: 100,
  height: 300
} as const;

export default function VoteChart({
  teamAPercentage,
  teamAVotes,
  teamBPercentage,
  teamBVotes,
  neutralPercentage,
  neutralVotes
}: VoteChartProps) {
  const chartData: ChartData[] = [
    { name: '코드 A 지지', value: teamAVotes, percentage: teamAPercentage, color: COLORS.TEAM_A },
    { name: '코드 B 지지', value: teamBVotes, percentage: teamBPercentage, color: COLORS.TEAM_B },
    { name: '중립/무효', value: neutralVotes, percentage: neutralPercentage, color: COLORS.NEUTRAL }
  ];

  const renderLabel = (props: { payload?: ChartData }) => {
    return props.payload ? `${props.payload.percentage}%` : '';
  };

  return (
    <div className="bg-slate-800 rounded-2xl p-8 border border-white/10">
      <p className="text-white text-[18px] font-bold mb-6 text-left flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
        실시간 투표 결과
      </p>
      <div className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={CHART_CONFIG.height}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={CHART_CONFIG.outerRadius}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="w-full mt-6">
          <ChartLegend
            payload={chartData.map((data) => ({
              value: data.name,
              color: data.color
            }))}
            chartData={chartData}
          />
        </div>
      </div>
    </div>
  );
}
