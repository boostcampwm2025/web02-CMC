import { Zap, Shield, ArrowRight, ArrowLeft } from 'lucide-react';

interface PhaseHeaderProps {
  type: 'challenge' | 'rebuttal';
}

export default function PhaseHeader({ type }: PhaseHeaderProps) {
  const isChallenge = type === 'challenge';
  const ArrowIcon = isChallenge ? ArrowRight : ArrowLeft;
  const teamALabel = isChallenge ? 'A 이의제기' : 'A 반론';
  const teamBLabel = isChallenge ? 'B 반론' : 'B 이의제기';
  const teamAColor = isChallenge ? 'orange' : 'blue';
  const teamBColor = isChallenge ? 'blue' : 'red';
  const gradientFrom = isChallenge ? 'orange-900/20' : 'blue-900/20';
  const gradientTo = isChallenge ? 'blue-900/20' : 'red-900/20';

  return (
    <div className={`px-6 py-3 bg-gradient-to-r from-${gradientFrom} to-${gradientTo} border-b border-[#2d2d3f]`}>
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          {isChallenge ? (
            <Zap className={`w-4 h-4 text-${teamAColor}-400`} />
          ) : (
            <Shield className={`w-4 h-4 text-${teamAColor}-400`} />
          )}
          <span className={`text-${teamAColor}-400 font-bold text-xs uppercase tracking-wider`}>{teamALabel}</span>
        </div>
        <ArrowIcon className="w-5 h-5 text-gray-500" />
        <div className="flex items-center gap-2">
          {isChallenge ? (
            <Shield className={`w-4 h-4 text-${teamBColor}-400`} />
          ) : (
            <Zap className={`w-4 h-4 text-${teamBColor}-400`} />
          )}
          <span className={`text-${teamBColor}-400 font-bold text-xs uppercase tracking-wider`}>{teamBLabel}</span>
        </div>
      </div>
    </div>
  );
}
