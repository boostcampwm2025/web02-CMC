import { RefreshCw, XCircle } from 'lucide-react';

interface ErrorSectionProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export default function ErrorSection({
  title = '배틀 데이터 로드 실패',
  message = '배틀 정보를 불러올 수 없습니다.',
  onRetry,
  retryLabel = '재시도하기'
}: ErrorSectionProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] px-4">
      <div className="bg-[#1E2939] border border-[#2A3544] rounded-2xl p-8 max-w-sm w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-600/20 blur-2xl rounded-full"></div>
            <div className="relative bg-orange-600/10 p-4 rounded-full border-2 border-orange-500/30">
              <XCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>

        <p className="text-[#6A7282] text-sm mb-6">{message}</p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-orange-500/50"
          >
            <RefreshCw className="w-4 h-4" />
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
