import { useState } from 'react';
import CodeViewer from './CodeViewer';
import { useCodeHover } from '../hooks/useCodeHover';

interface CodeCarouselProps {
  aCode: string;
  bCode: string;
  language: string;
}

export default function CodeCarousel({ aCode, bCode, language }: CodeCarouselProps) {
  const [currentCode, setCurrentCode] = useState<'A' | 'B'>('A');
  const { hoveredCode, handleHover, handleLeave } = useCodeHover();

  const goToPrevious = () => {
    setCurrentCode('A');
  };

  const goToNext = () => {
    setCurrentCode('B');
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 코드 뷰어 영역 */}
      <div className="flex items-center justify-center gap-4 w-full">
        {/* A 코드 */}
        <div onMouseEnter={() => handleHover('A')} onMouseLeave={handleLeave}>
          {currentCode === 'A' && (
            <CodeViewer code={aCode} language={language} team="A" isHovered={hoveredCode === 'A'} />
          )}
        </div>

        {/* B 코드 */}
        <div onMouseEnter={() => handleHover('B')} onMouseLeave={handleLeave}>
          {currentCode === 'B' && (
            <CodeViewer code={bCode} language={language} team="B" isHovered={hoveredCode === 'B'} />
          )}
        </div>
      </div>

      {/* 네비게이션 */}
      <div className="flex items-center gap-4">
        <button
          onClick={goToPrevious}
          className="px-4 py-2 rounded-full bg-[#2D2D3F] hover:bg-[#3D3D4F] transition-colors text-white text-xl font-bold"
          aria-label="이전 코드"
        >
          ←
        </button>

        <span className="text-white font-medium text-lg">{currentCode}</span>

        <button
          onClick={goToNext}
          className="px-4 py-2 rounded-full bg-[#2D2D3F] hover:bg-[#3D3D4F] transition-colors text-white text-xl font-bold"
          aria-label="다음 코드"
        >
          →
        </button>
      </div>
    </div>
  );
}
