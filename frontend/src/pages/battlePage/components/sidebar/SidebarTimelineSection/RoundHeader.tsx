import { ChevronDown, ChevronUp } from 'lucide-react';

interface RoundHeaderProps {
  round: string;
  topic: string;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function RoundHeader({ round, topic, isActive, isExpanded, onToggle }: RoundHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full px-3 py-2 flex items-center justify-between bg-[#16162a] hover:bg-[#1a1a2e] transition-all"
    >
      <div className="flex items-center gap-2">
        <div
          className={`px-2 py-1 rounded text-[10px] font-bold ${isActive ? 'bg-orange-500 text-white' : 'bg-gray-700/50 text-gray-400'}`}
        >
          Round {round}
        </div>

        <div
          className={`px-2 py-1 rounded text-[10px] font-bold ${isActive ? 'bg-purple-500 text-white' : 'bg-gray-700/50 text-gray-400'}`}
        >
          {topic}
        </div>
      </div>
      <div className="text-gray-400">
        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </div>
    </button>
  );
}
