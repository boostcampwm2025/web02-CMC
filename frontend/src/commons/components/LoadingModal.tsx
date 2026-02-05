interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
}

export default function LoadingModal({ isOpen, message = '처리 중입니다...' }: LoadingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative rounded-3xl border border-orange-500/20 bg-gradient-to-br from-[#1a1a2e] to-[#121226] p-10 shadow-[0_20px_60px_rgba(255,105,0,0.3)] animate-in zoom-in-95 duration-300">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent blur-xl"></div>

        <div className="relative flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-orange-500/20 border-t-orange-500 shadow-[0_0_20px_rgba(255,105,0,0.5)]"></div>
            <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-4 border-orange-500/30 opacity-20"></div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              {message}
            </p>
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.3s]"></span>
              <span className="h-2 w-2 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.15s]"></span>
              <span className="h-2 w-2 animate-bounce rounded-full bg-orange-500"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
