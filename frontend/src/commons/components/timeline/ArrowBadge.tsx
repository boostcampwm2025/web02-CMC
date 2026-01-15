import { ArrowRight, ArrowLeft } from 'lucide-react';

interface ArrowBadgeProps {
  type: 'challenge' | 'rebuttal';
}

export default function ArrowBadge({ type }: ArrowBadgeProps) {
  const isChallenge = type === 'challenge';
  const ArrowIcon = isChallenge ? ArrowRight : ArrowLeft;
  const colorClass = isChallenge ? 'orange' : 'red';
  const gradientDirection = isChallenge ? 'from-orange-500 to-blue-600' : 'from-red-500 to-blue-600';

  return (
    <div className="hidden md:flex items-center justify-center px-4 bg-[#0a0a1a] border-r border-[#2d2d3f]">
      <div className="relative">
        <div className={`absolute inset-0 bg-${colorClass}-500/20 blur-lg rounded-full`} />
        <div
          className={`relative bg-gradient-to-${isChallenge ? 'r' : 'l'} ${gradientDirection} w-12 h-12 rounded-full flex items-center justify-center border-2 border-${colorClass}-400/50 shadow-lg`}
        >
          <ArrowIcon className="w-5 h-5 text-white font-bold" />
        </div>
      </div>
    </div>
  );
}
