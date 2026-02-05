import type { SpotlightPosition } from '@/pages/battlePage/hooks/useSpotlight';

interface SpotlightOverlayProps {
  spotlight: SpotlightPosition | null;
  onBackdropClick?: () => void;
}

export default function SpotlightOverlay({ spotlight, onBackdropClick }: SpotlightOverlayProps) {
  if (!spotlight) {
    return <div className="absolute inset-0 bg-black/70 pointer-events-auto" onClick={onBackdropClick} />;
  }

  return (
    <>
      <div
        className="absolute left-0 right-0 bg-black/70 pointer-events-auto transition-all duration-300"
        style={{ top: 0, height: `${spotlight.top}px` }}
        onClick={onBackdropClick}
      />
      <div
        className="absolute bg-black/70 pointer-events-auto transition-all duration-300"
        style={{
          top: `${spotlight.top}px`,
          left: 0,
          width: `${spotlight.left}px`,
          height: `${spotlight.height}px`
        }}
        onClick={onBackdropClick}
      />
      <div
        className="absolute bg-black/70 pointer-events-auto transition-all duration-300"
        style={{
          top: `${spotlight.top}px`,
          left: `${spotlight.left + spotlight.width}px`,
          right: 0,
          height: `${spotlight.height}px`
        }}
        onClick={onBackdropClick}
      />
      <div
        className="absolute left-0 right-0 bg-black/70 pointer-events-auto transition-all duration-300"
        style={{
          top: `${spotlight.top + spotlight.height}px`,
          bottom: 0
        }}
        onClick={onBackdropClick}
      />
      <div
        className="absolute border-2 border-[#FF6900] rounded-lg pointer-events-none transition-all duration-300 shadow-[0_0_20px_rgba(255,105,0,0.5)]"
        style={{
          top: `${spotlight.top}px`,
          left: `${spotlight.left}px`,
          width: `${spotlight.width}px`,
          height: `${spotlight.height}px`
        }}
      />
    </>
  );
}
