import { Zap, Shield, ArrowRight } from 'lucide-react';

interface PhaseHeaderProps {
  phase: 'attack-A' | 'attack-B';
}

export default function PhaseHeader({ phase }: PhaseHeaderProps) {
  if (phase === 'attack-A') {
    return (
      <div className="px-2 py-1.5 bg-gradient-to-r from-orange-900/20 to-blue-900/20 border-b border-[#2d2d3f]">
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-orange-400" />
            <span className="text-blue-400 font-bold text-[0.563rem] uppercase">A팀 이의제기</span>
          </div>
          <ArrowRight className="w-3 h-3 text-gray-500" />
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-blue-400" />
            <span className="text-red-400 font-bold text-[0.563rem] uppercase">B팀 반론</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 py-1.5 bg-gradient-to-r from-blue-900/20 to-red-900/20 border-b border-[#2d2d3f]">
      <div className="flex items-center justify-center gap-2">
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-red-400" />
          <span className="text-red-400 font-bold text-[0.563rem] uppercase">B팀 이의제기</span>
        </div>
        <ArrowRight className="w-3 h-3 text-gray-500" />
        <div className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-blue-400" />
          <span className="text-blue-400 font-bold text-[0.563rem] uppercase">A팀 반론</span>
        </div>
      </div>
    </div>
  );
}
