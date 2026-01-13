import { useState, useEffect } from 'react';

interface UseResizeOptions {
  initialWidth: number;
}

const MIN_WIDTH = 330;
const MAX_WIDTH = 800;

export function useResize({ initialWidth }: UseResizeOptions) {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        const newWidth = e.clientX;
        if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
          setWidth(newWidth);
        }
        rafId = null;
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isResizing]);

  return {
    width,
    isResizing,
    setIsResizing
  };
}
