import { useEffect, useState, useCallback } from 'react';
import Icon from '@/commons/components/Icon';

interface SkipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ANIMATION_DURATION = {
  SHOW: 50,
  AUTO_CLOSE: 2000,
  HIDE: 300
} as const;

export default function SkipModal({ isOpen, onClose }: SkipModalProps) {
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in">
          <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-3xl border-2 border-blue-500/50 shadow-2xl shadow-blue-500/30 p-12 max-w-2xl w-full mx-4 animate-scale-in">
            {/* 네온 효과 */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 animate-pulse" />

            {/* 상단 아이콘 */}
            <div className="relative flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/50 animate-bounce">
                <Icon name="skip" className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* 스킵 메시지 */}
            <div className="relative text-center mb-4">
              <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 animate-gradient">
                페이즈 스킵!
              </h2>
            </div>

            {/* 구분선 */}
            <div className="relative h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent mb-6 rounded-full" />

            {/* 설명 */}
            <div className="relative text-center space-y-4">
              <div className="bg-[#0a0a1a]/50 border-2 border-blue-500/30 rounded-xl p-6">
                <p className="text-blue-400 text-xl font-semibold">모든 참여자가 스킵에 동의했습니다</p>
                <p className="text-gray-300 text-sm mt-2">다음 페이즈로 이동합니다...</p>
              </div>
            </div>

            {/* 하단 프로그레스 바 */}
            <div className="relative mt-8 h-2 bg-[#0a0a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-progress"
                style={{ animationDuration: '1.5s' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
