interface Step1BattleInfoProps {
  title: string;
  description: string;
  category: string;
  language: string;
  currentRound: number;
  totalRounds: number;
  totalParticipants: number;
}

export default function Step1BattleInfo({
  title,
  description,
  category,
  language,
  currentRound,
  totalRounds,
  totalParticipants
}: Step1BattleInfoProps) {
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
      {/* 배틀 정보 카드 */}
      <div className="bg-[#1E1E2F] border-2 border-[#2D2D3F] rounded-lg p-8 w-full">
        <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
        <p className="text-[#99A1AF] text-lg mb-6">{description}</p>

        <div className="flex items-center gap-4 text-sm">
          <span className="px-3 py-1 bg-[#2D2D3F] rounded-full text-[#FF8533]">{category}</span>
          <span className="px-3 py-1 bg-[#2D2D3F] rounded-full text-[#51A2FF]">{language}</span>
        </div>
      </div>

      {/* 진행 상황 */}
      <div className="flex items-center justify-around w-full bg-[#1E1E2F] border-2 border-[#2D2D3F] rounded-lg p-6">
        <div className="flex flex-col items-center">
          <span className="text-[#99A1AF] text-sm mb-2">현재 진행</span>
          <span className="text-2xl font-bold text-white">
            라운드 {currentRound} / {totalRounds}
          </span>
        </div>

        <div className="w-px h-12 bg-[#2D2D3F]" />

        <div className="flex flex-col items-center">
          <span className="text-[#99A1AF] text-sm mb-2">참여자</span>
          <span className="text-2xl font-bold text-white">{totalParticipants}명</span>
        </div>
      </div>
    </div>
  );
}
