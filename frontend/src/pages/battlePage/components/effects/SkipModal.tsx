import { useEffect } from 'react';
import Icon from '@/commons/components/Icon';
import Modal from '@/commons/components/Modal';

interface SkipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SkipModal({ isOpen, onClose }: SkipModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} zIndex="z-[100]" bg="bg-black/80">
      {(isAnimating) => (
        <div
          className={`relative bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-3xl border-2 border-blue-500/50 shadow-2xl shadow-blue-500/30 p-12 max-w-2xl w-full mx-4 transition-all duration-500 ease-out ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 animate-pulse" />

          <div className="relative flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/50 animate-bounce">
              <Icon name="skip" className="w-12 h-12 text-white" />
            </div>
          </div>

          <div className="relative text-center mb-4">
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 animate-gradient">
              페이즈 스킵!
            </h2>
          </div>

          <div className="relative h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent mb-6 rounded-full" />

          <div className="relative text-center space-y-4">
            <div className="bg-[#0a0a1a]/50 border-2 border-blue-500/30 rounded-xl p-6">
              <p className="text-blue-400 text-xl font-semibold">모든 참여자가 스킵에 동의했습니다</p>
              <p className="text-gray-300 text-sm mt-2">다음 페이즈로 이동합니다...</p>
            </div>
          </div>

          <div className="relative mt-8 h-2 bg-[#0a0a1a] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-progress"
              style={{ animationDuration: '1.5s' }}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
