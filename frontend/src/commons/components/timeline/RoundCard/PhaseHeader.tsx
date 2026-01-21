import { Zap, Shield, ArrowRight } from 'lucide-react';

export default function PhaseHeader() {
  return (
    <div className="px-6 py-3 bg-gradient-to-r from-orange-900/20 to-blue-900/20 border-b border-[#2d2d3f]">
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-orange-400" />
          <span className="text-orange-400 font-bold text-xs uppercase tracking-wider">이의제기</span>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-500" />
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">반박</span>
        </div>
      </div>
    </div>
  );
}
