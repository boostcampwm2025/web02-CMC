interface DiscussionVoteItemProps {
  user: string;
  team: 'A' | 'B';
  content: string;
  votes: number;
  totalVotes: number;
  hasVoted: boolean;
  onVote: () => void;
}

export default function DiscussionVoteItem({
  user,
  team,
  content,
  votes,
  totalVotes,
  hasVoted,
  onVote
}: DiscussionVoteItemProps) {
  const getVotePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  return (
    <button
      onClick={hasVoted ? undefined : onVote}
      disabled={hasVoted}
      className={`w-full p-3 rounded-lg border text-left transition-all ${
        hasVoted ? 'bg-[#1E3A2E] border-[#2ECC71]' : 'bg-[#2D2D3F] border-[#3D3D4F] hover:border-[#4D4D5F]'
      } ${!hasVoted ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${team === 'A' ? 'text-[#51A2FF]' : 'text-[#FF5A5F]'}`}>{user}</span>
          {hasVoted && (
            <span className="text-[0.625rem] px-1.5 py-0.5 bg-[#2ECC71] text-white rounded">✓ 투표완료</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-lg font-bold ${hasVoted ? 'text-[#2ECC71]' : 'text-white'}`}>{votes}</span>
          <span className="text-xs text-[#99A1AF]">표</span>
        </div>
      </div>

      <p className="text-sm text-white mb-3">{content}</p>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-[#1E1E2F] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${hasVoted ? 'bg-[#2ECC71]' : 'bg-[#4A5568]'}`}
              style={{ width: `${getVotePercentage(votes, totalVotes)}%` }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}
