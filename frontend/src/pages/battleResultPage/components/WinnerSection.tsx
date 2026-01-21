import TrophyIcon from '@/assets/icon/trophy.svg?react';

interface WinnerSectionProps {
  winner: 'A' | 'B' | 'DRAW';
  teamAPercentage: number;
  teamAVotes: number;
  teamBPercentage: number;
  teamBVotes: number;
}

export default function WinnerSection({
  winner,
  teamAPercentage,
  teamAVotes,
  teamBPercentage,
  teamBVotes
}: WinnerSectionProps) {
  const winnerTeam = winner === 'A' ? 'A' : winner === 'B' ? 'B' : '무승부';

  return (
    <div className="max-w-7xl mx-auto mb-12">
      <div className="bg-gradient-to-br from-[#155DFC] to-[#1447E6] rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-blue-500/40">
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
