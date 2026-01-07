import { useState } from 'react';

interface UseCodeHoverReturn {
  hoveredCode: 'A' | 'B' | null;
  handleHover: (code: 'A' | 'B') => void;
  handleLeave: () => void;
  getCodeWidth: (code: 'A' | 'B') => string;
}

export function useCodeHover(): UseCodeHoverReturn {
  const [hoveredCode, setHoveredCode] = useState<'A' | 'B' | null>(null);

  const handleHover = (code: 'A' | 'B') => {
    setHoveredCode(code);
  };

  const handleLeave = () => {
    setHoveredCode(null);
  };

  const getCodeWidth = (code: 'A' | 'B'): string => {
    if (!hoveredCode) return '50%';
    return hoveredCode === code ? '70%' : '30%';
  };

  return {
    hoveredCode,
    handleHover,
    handleLeave,
    getCodeWidth
  };
}
