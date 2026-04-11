import { useEffect } from 'react';
import Icon from '@/commons/components/Icon';
import Modal from '@/commons/components/Modal';

interface RoundUpdateModalProps {
  isOpen: boolean;
  round: number;
  topic: string;
  onClose: () => void;
}

export default function RoundUpdateModal({ isOpen, round, topic, onClose }: RoundUpdateModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} zIndex="z-[100]" bg="bg-black/80">
      {(isAnimating) => {
        const modalClass = isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0';
        const badgeClass = isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0';
        const contentClass = isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0';

        return (
          <div
            className={`relative max-w-2xl w-full mx-4 p-12 rounded-3xl bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border-2 border-orange-500/50 shadow-2xl shadow-orange-500/30 transition-all duration-500 ease-out ${modalClass}`}
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 animate-pulse" />

            <div className={`relative flex justify-center mb-6 transition-all duration-500 ${badgeClass}`}>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/50">
                <Icon name="crown" className="w-12 h-12 text-orange-200 bg-orange-200 bg-orange-200/0" />
              </div>
            </div>

            <div className={`relative text-center mb-4 transition-all duration-500 delay-100 ${contentClass}`}>
              <h2 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-orange-400">
                Round {round}
              </h2>
            </div>

            <div
              className={`relative h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent mb-6 rounded-full transition-opacity duration-500 delay-150 ${contentClass}`}
            />

            <div className={`relative text-center space-y-4 transition-all duration-500 delay-200 ${contentClass}`}>
              <p className="text-gray-300 text-lg">이번 라운드는</p>

              <div className="bg-[#0a0a1a]/50 border-2 border-orange-500/30 rounded-xl p-6">
                <p className="text-orange-400 text-2xl font-bold">{topic}</p>
              </div>

              <p className="text-gray-300 text-lg">과 관련된 내용으로 토론을 진행해주세요.</p>
            </div>
          </div>
        );
      }}
    </Modal>
  );
}
