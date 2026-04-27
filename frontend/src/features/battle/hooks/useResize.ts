import { useState, useEffect } from 'react';

interface UseResizeOptions {
  initialWidth: number;
  storageKey?: string;
}

const MIN_WIDTH = 330;
const MAX_WIDTH = 800;

export function useResize({ initialWidth, storageKey = 'sidebar-width' }: UseResizeOptions) {
  const [width, setWidth] = useState(() => {
    if (typeof window === 'undefined') return initialWidth;

    const savedWidth = localStorage.getItem(storageKey);
    if (savedWidth) {
      const parsedWidth = parseInt(savedWidth, 10);
      if (parsedWidth >= MIN_WIDTH && parsedWidth <= MAX_WIDTH) {
        return parsedWidth;
      }
    }
    return initialWidth;
  });
  const [isResizing, setIsResizing] = useState(false);

  // localStorage에 너비 저장
  useEffect(() => {
    localStorage.setItem(storageKey, width.toString());
  }, [width, storageKey]);

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
