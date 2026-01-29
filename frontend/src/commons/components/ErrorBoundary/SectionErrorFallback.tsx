import { AlertTriangle, RefreshCw } from 'lucide-react';

interface SectionErrorFallbackProps {
  error: Error;
  reset: () => void;
  title?: string;
  className?: string;
  minHeight?: number;
}

export default function SectionErrorFallback({
  error,
  reset,
  title = '데이터를 불러올 수 없습니다',
  className = '',
  minHeight = 300
}: SectionErrorFallbackProps) {
  return (
    <div
      style={{ minHeight: `${minHeight}px` }}
      className={`w-full bg-[#1A1A2E] border border-[#364153] rounded-xl p-8 flex flex-col items-center justify-center animate-fadeIn ${className}`}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="p-3 bg-orange-500/10 rounded-full">
          <AlertTriangle className="w-8 h-8 text-orange-500" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-400">{error.message}</p>
        </div>

        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          다시 시도
        </button>
      </div>
    </div>
  );
}
