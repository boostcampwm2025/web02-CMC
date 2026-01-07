import { useEffect, useState, useCallback } from 'react';

interface TeamVoteResultModalProps {
  isOpen: boolean;
  round: number;
  teamACount: number;
  teamBCount: number;
  teamAPercentage: number;
  teamBPercentage: number;
  leadingTeam: 'A' | 'B' | null;
  onClose: () => void;
}

export default function TeamVoteResultModal({
  isOpen,
  round,
  teamACount,
  teamBCount,
  teamAPercentage,
  teamBPercentage,
  leadingTeam,
  onClose
}: TeamVoteResultModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    setIsVisible(true);
    const showTimer = setTimeout(() => setIsAnimating(true), 50);

    return () => {
      clearTimeout(showTimer);
    };
  }, [isOpen]);

  if (!isVisible) return null;

  const animationClass = isAnimating ? 'opacity-100' : 'opacity-0';
  const scaleClass = isAnimating ? 'scale-100 opacity-100' : 'scale-50 opacity-0';
  const badgeClass = isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0';
  const cardClass = isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 ${animationClass}`}
      style={{ background: 'linear-gradient(180deg, #000000 0%, #0A0A1F 50%, #000000 100%)' }}
      onClick={handleClose}
    >
      <div
        className={`relative flex flex-col items-center transition-all duration-500 ${scaleClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 blur-[100px] bg-gradient-to-r from-orange-500 to-red-500 opacity-25 animate-pulse scale-125" />

        <div className="flex flex-col items-center gap-16 min-w-[800px]">
          <div
            className={`px-6 py-2 rounded-full border-[#FF6900]/30 border-[1px] bg-gradient-to-r from-[#FF8900]/20 to-[#FF6900]/20 shadow-lg transition-all duration-500 ${badgeClass}`}
          >
            <span className="text-[#FF8904] font-bold text-lg tracking-wider">ROUND {round} 결과</span>
          </div>

          <div className={`flex items-center gap-6 transition-all duration-500 delay-200 ${cardClass}`}>
            <div
              className={`relative transition-all duration-500 ${leadingTeam === 'A' ? 'scale-[1.15]' : 'scale-100'}`}
            >
              <div
                className={`w-[413px] h-[255px] p-6 rounded-2xl border-2 backdrop-blur-sm flex flex-col justify-between ${
                  leadingTeam === 'A'
                    ? 'bg-blue-500/20 border-blue-400 shadow-lg shadow-blue-500/50'
                    : 'bg-gray-800/50 border-gray-600'
                }`}
              >
                <div className="flex flex-col items-start gap-1">
                  <h3 className="text-[#51A2FF] font-bold text-[30px]">TEAM A</h3>
                  {leadingTeam === 'A' && <span className="text-[12px] text-blue-300 font-bold">⚡ Leading</span>}
                </div>
                <div className="flex flex-col items-start gap-1">
                  <div className="text-[56px] font-black text-blue-400 leading-none">{teamACount}</div>
                  <div className="text-gray-400">
                    이전 <span className="text-sm">{teamACount - 4}</span> <span className="text-green-400">+4</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-1000"
                    style={{ width: `${teamAPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 border-[1px] border-[#FF8904]/50 w-[96px] h-[96px] rounded-full bg-gradient-to-b from-[#FF6900] to-[#FF4900] flex items-center justify-center text-white font-black text-[24px] shadow-lg z-10">
              VS
            </div>

            <div
              className={`relative transition-all duration-500 ${leadingTeam === 'B' ? 'scale-[1.15]' : 'scale-100'}`}
            >
              <div
                className={`w-[413px] h-[255px] p-6 rounded-2xl border-2 backdrop-blur-sm flex flex-col justify-between ${
                  leadingTeam === 'B'
                    ? 'bg-red-500/20 border-red-400 shadow-lg shadow-red-500/50'
                    : 'bg-gray-800/50 border-gray-600'
                }`}
              >
                <div className="flex flex-col items-start gap-1">
                  <h3 className="text-[#FF6467] font-bold text-[30px]">TEAM B</h3>
                  {leadingTeam === 'B' && <span className="text-[12px] text-red-300 font-bold">⚡ Leading</span>}
                </div>
                <div className="flex flex-col items-start gap-1">
                  <div className="text-[56px] font-black text-red-400 leading-none">{teamBCount}</div>
                  <div className="text-gray-400">
                    이전 <span className="text-sm">{teamBCount - 1}</span> <span className="text-green-400">+1</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-1000"
                    style={{ width: `${teamBPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className={`w-full bg-gray-800/80 backdrop-blur-sm  rounded-2xl border-2 border-gray-700 p-6 transition-all duration-500 delay-400 ${cardClass}`}
          >
            <p
              className={`text-center font-bold text-[30px] mb-3 ${
                leadingTeam === 'A' ? 'text-blue-400' : 'text-red-400'
              }`}
            >
              {leadingTeam === 'A' ? 'A' : 'B'}팀이 우세하고 있습니다!
            </p>
            <div className="flex items-center gap-3">
              <span className="text-blue-400 font-bold text-lg min-w-[40px]">{teamACount}</span>
              <div className="flex-1 flex items-center gap-0 h-8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-1000"
                  style={{ width: `${teamAPercentage}%` }}
                />
                <div
                  className="h-full bg-red-500 transition-all duration-1000"
                  style={{ width: `${teamBPercentage}%` }}
                />
              </div>
              <span className="text-red-400 font-bold text-lg min-w-[40px] text-right">{teamBCount}</span>
            </div>
            <div className="flex justify-between mt-2 text-sm font-bold px-2">
              <span className="text-blue-400">{teamAPercentage.toFixed(1)}%</span>
              <span className="text-red-400">{teamBPercentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
