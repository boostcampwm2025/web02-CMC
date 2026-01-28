import { useState, useEffect } from 'react';

export interface SpotlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface UseSpotlightOptions {
  selector: string | null | undefined;
  enabled?: boolean;
  padding?: number;
}

export function useSpotlight({ selector, enabled = true, padding = 8 }: UseSpotlightOptions) {
  const [position, setPosition] = useState<SpotlightPosition | null>(null);

  useEffect(() => {
    if (!enabled || !selector) {
      setPosition(null);
      return;
    }

    const updateSpotlight = () => {
      const element = document.querySelector(selector);
      if (element) {
        const rect = element.getBoundingClientRect();

        setPosition({
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2
        });
      } else {
        setPosition(null);
      }
    };

    updateSpotlight();
    const animationFrameId = window.requestAnimationFrame(updateSpotlight);
    const delayedUpdateId = window.setTimeout(updateSpotlight, 350);

    window.addEventListener('resize', updateSpotlight);
    window.addEventListener('scroll', updateSpotlight, true);

    return () => {
      window.removeEventListener('resize', updateSpotlight);
      window.removeEventListener('scroll', updateSpotlight, true);
      window.cancelAnimationFrame(animationFrameId);
      window.clearTimeout(delayedUpdateId);
    };
  }, [enabled, selector, padding]);

  return position;
}
