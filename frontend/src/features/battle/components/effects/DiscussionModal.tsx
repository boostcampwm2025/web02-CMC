import { useEffect } from 'react';
import Modal from '@/commons/components/Modal';

interface DiscussionModalProps {
  isOpen: boolean;
  team: 'A' | 'B';
  content: string;
  type: 'attack' | 'defense';
  onClose: () => void;
}

const TEAM_STYLES = {
  A: { gradient: 'from-cyan-500 to-blue-500', glow: 'shadow-cyan-500/50' },
  B: { gradient: 'from-orange-500 to-red-500', glow: 'shadow-orange-500/50' }
} as const;

export default function DiscussionModal({ isOpen, team, content, type, onClose }: DiscussionModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  const { gradient, glow } = TEAM_STYLES[team];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {(isAnimating) => {
        const scaleClass = isAnimating ? 'scale-100 opacity-100' : 'scale-50 opacity-0';
        const badgeClass = isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0';
        const textClass = isAnimating ? 'scale-100' : 'scale-0';
        const cardClass = isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0';

        return (
          <div
            className={`relative flex flex-col items-center transition-all duration-500 ${scaleClass}`}
            onClick={onClose}
          >
            <div className={`absolute inset-0 blur-3xl bg-gradient-to-r ${gradient} opacity-30 animate-pulse`} />

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
                <p className="text-gray-100 text-lg leading-relaxed break-all">{content}</p>
              </div>
            </div>
          </div>
        );
      }}
    </Modal>
  );
}
