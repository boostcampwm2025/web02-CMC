import { useEffect, useState, useCallback } from 'react';
import Icon from '@/commons/components/Icon';

interface RoundUpdateModalProps {
  isOpen: boolean;
  round: number;
  topic: string;
  onClose: () => void;
}

const ANIMATION_DURATION = {
  SHOW: 50,
  AUTO_CLOSE: 3000,
  HIDE: 300
} as const;

export default function RoundUpdateModal({ isOpen, round, topic, onClose }: RoundUpdateModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, ANIMATION_DURATION.HIDE);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    setIsVisible(true);
    const showTimer = setTimeout(() => setIsAnimating(true), ANIMATION_DURATION.SHOW);
    const closeTimer = setTimeout(handleClose, ANIMATION_DURATION.AUTO_CLOSE);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
    };
  }, [isOpen, handleClose]);

  if (!isVisible) return null;

  const overlayClass = isAnimating ? 'opacity-100' : 'opacity-0';
  const modalClass = isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0';
  const badgeClass = isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0';
  const contentClass = isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0';

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm
      bg-black/80 transition-opacity duration-300 ${overlayClass}`}
      onClick={handleClose}
    >
      <div
        className={`relative max-w-2xl w-full mx-4 p-12 rounded-3xl
        bg-gradient-to-br from-[#1a1a2e] to-[#16162a]
        border-2 border-orange-500/50
        shadow-2xl shadow-orange-500/30
        transition-all duration-500 ease-out ${modalClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* glow layer */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 animate-pulse" />

        {/* crown */}
        <div className={`relative flex justify-center mb-6 transition-all duration-500 ${badgeClass}`}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/50">
            <Icon name="crown" className="w-12 h-12 text-orange-200 bg-orange-200 bg-orange-200/0" />
          </div>
        </div>

        {/* round title */}
        <div className={`relative text-center mb-4 transition-all duration-500 delay-100 ${contentClass}`}>
          <h2 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-orange-400">
            Round {round}
          </h2>
        </div>

        {/* divider */}
        <div
          className={`relative h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent
          mb-6 rounded-full transition-opacity duration-500 delay-150 ${contentClass}`}
        />

        {/* topic */}
        <div className={`relative text-center space-y-4 transition-all duration-500 delay-200 ${contentClass}`}>
          <p className="text-gray-300 text-lg">이번 라운드는</p>

          <div className="bg-[#0a0a1a]/50 border-2 border-orange-500/30 rounded-xl p-6">
            <p className="text-orange-400 text-2xl font-bold">{topic}</p>
          </div>

          <p className="text-gray-300 text-lg">과 관련된 내용으로 토론을 진행해주세요.</p>
        </div>
      </div>
    </div>
  );
}
