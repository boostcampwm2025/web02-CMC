import { useEffect, useState, useCallback } from 'react';

interface DiscussionModalProps {
  isOpen: boolean;
  team: 'A' | 'B';
  content: string;
  type: 'attack' | 'defense';
  onClose: () => void;
}

const TEAM_STYLES = {
  A: {
    gradient: 'from-cyan-500 to-blue-500',
    glow: 'shadow-cyan-500/50'
  },
  B: {
    gradient: 'from-orange-500 to-red-500',
    glow: 'shadow-orange-500/50'
  }
} as const;

const ANIMATION_DURATION = {
  SHOW: 50,
  AUTO_CLOSE: 3000,
  HIDE: 300
} as const;

export default function DiscussionModal({ isOpen, team, content, type, onClose }: DiscussionModalProps) {
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

  const { gradient, glow } = TEAM_STYLES[team];
  const animationClass = isAnimating ? 'opacity-100' : 'opacity-0';
  const scaleClass = isAnimating ? 'scale-100 opacity-100' : 'scale-50 opacity-0';
  const badgeClass = isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0';
  const textClass = isAnimating ? 'scale-100' : 'scale-0';
  const cardClass = isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${animationClass}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="discussion-modal-title"
    >
      <div
        className={`relative flex flex-col items-center transition-all duration-500 ${scaleClass}`}
        onClick={handleClose}
      >
        <div className={`absolute inset-0 blur-3xl bg-gradient-to-r ${gradient} animate-pulse-slow`} />

        <div className="relative z-10 flex flex-col items-center gap-8">
          <div
            className={`px-6 py-2 rounded-full bg-gradient-to-r ${gradient} shadow-lg ${glow} transition-all duration-500 ${badgeClass}`}
          >
            <span className="text-white font-bold text-lg tracking-wider">
              {team}팀 {type === 'attack' ? '이의제기' : '반론'}
            </span>
          </div>

          <div className={`relative transition-all duration-700 delay-200 ${textClass}`}>
            <h1
              className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300"
              style={{
                WebkitTextStroke: '3px rgba(255, 255, 255, 0.3)',
                textShadow: '0 0 40px rgba(255, 255, 255, 0.5), 0 0 80px rgba(255, 255, 255, 0.3)'
              }}
            >
              {type === 'attack' ? '이의제기!!' : '반론!!'}
            </h1>
          </div>

          <div
            className={`max-w-2xl px-8 py-6 bg-gray-800/80 backdrop-blur-sm rounded-2xl border-2 border-gray-700 shadow-2xl transition-all duration-500 delay-400 ${cardClass}`}
          >
            <p className="text-gray-100 text-lg leading-relaxed">{content}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
