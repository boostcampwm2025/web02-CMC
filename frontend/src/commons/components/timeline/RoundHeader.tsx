import { ChevronDown, ChevronUp, Flame } from 'lucide-react';

interface RoundHeaderProps {
  round: number;
  topic: string;
  isActive: boolean;
  isFuture: boolean;
  isExpanded: boolean;
  hasContent: boolean;
  onToggle: () => void;
}

export default function RoundHeader({
  round,
  topic,
  isActive,
  isFuture,
  isExpanded,
  hasContent,
  onToggle
}: RoundHeaderProps) {
  return (
    <button
      onClick={onToggle}
      disabled={isFuture}
      className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[#16162a] to-[#1a1a2e] hover:from-[#1a1a2e] hover:to-[#1e1e2f] transition-all disabled:cursor-not-allowed"
    >
      <div className="flex items-center gap-3">
        {/* Round Badge */}
        <div
          className={`px-4 py-2 rounded-lg font-bold ${
            isActive
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
              : isFuture
                ? 'bg-gray-700/30 text-gray-600'
                : 'bg-gray-700/50 text-gray-400'
          }`}
        >
          Round {round}
        </div>
        <div
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
            isActive
              ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-md shadow-purple-400/20'
              : isFuture
                ? 'bg-gray-700/20 text-gray-500'
                : 'bg-gray-700/40 text-gray-400'
          }`}
        >
          {topic}
        </div>

        {/* Status Indicator */}
        {isActive && (
          <div className="flex items-center gap-2 text-orange-400">
            <Flame className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-bold">진행 중</span>
          </div>
        )}

        {!isFuture && !isActive && hasContent && <div className="text-sm text-gray-500">완료</div>}

        {isFuture && <div className="text-sm text-gray-600">대기 중</div>}
      </div>

      {/* Expand Icon */}
      {!isFuture && (
        <div className="text-gray-400">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      )}
    </button>
  );
}
