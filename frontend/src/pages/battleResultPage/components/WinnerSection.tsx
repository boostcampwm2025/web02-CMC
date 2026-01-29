import TrophyIcon from '@/assets/icon/trophy.svg?react';

interface WinnerSectionProps {
  winner: 'A' | 'B' | 'DRAW';
  teamAPercentage: number;
  teamAVotes: number;
  teamBPercentage: number;
  teamBVotes: number;
}

const WINNER_STYLES = {
  A: {
    gradient: 'bg-gradient-to-br from-[#155DFC] to-[#1447E6]',
    shadow: 'shadow-blue-500/40'
  },
  B: {
    gradient: 'bg-gradient-to-br from-[#DC2626] to-[#B91C1C]',
    shadow: 'shadow-red-500/40'
  },
  DRAW: {
    gradient: 'bg-gradient-to-br from-[#4B5563] to-[#374151]',
    shadow: 'shadow-gray-500/40'
  }
} as const;

export default function WinnerSection({
  winner,
  teamAPercentage,
  teamAVotes,
  teamBPercentage,
  teamBVotes
}: WinnerSectionProps) {
  const winnerTeam = winner === 'A' ? 'A' : winner === 'B' ? 'B' : '무승부';
  const style = WINNER_STYLES[winner];

  return (
    <div className="max-w-7xl mx-auto mb-12">
      <div className={`${style.gradient} rounded-3xl p-8 md:p-12 text-center shadow-2xl ${style.shadow}`}>
        <div className="flex justify-center mb-4">
          <TrophyIcon className="w-[48px] h-[48px]" />
        </div>
        <div className="px-8 py-3 text-lg md:text-xl font-semibold mb-8">🎉 승리 팀: 코드 {winnerTeam}</div>
        <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
          <div className="flex flex-col items-center">
            <span className="text-[48px] md:text-6xl font-extrabold">{teamAPercentage}%</span>
            <span className="text-[16px] md:text-base opacity-90 mt-2">코드 A ({teamAVotes}표)</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold opacity-60">VS</div>
          <div className="flex flex-col items-center">
            <span className="text-[48px] md:text-6xl font-extrabold">{teamBPercentage}%</span>
            <span className="text-[16px] md:text-base opacity-90 mt-2">코드 B ({teamBVotes}표)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
