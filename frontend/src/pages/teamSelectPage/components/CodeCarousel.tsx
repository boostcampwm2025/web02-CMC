import CodeViewer from './CodeViewer';
import { useCodeHover } from '../hooks/useCodeHover';

interface CodeCarouselProps {
  aCode: string;
  bCode: string;
  language: string;
}

export default function CodeCarousel({ aCode, bCode, language }: CodeCarouselProps) {
  const { hoveredCode, handleHover, handleLeave } = useCodeHover();

  return (
    <div className="flex items-start justify-center gap-4 w-full">
      {/* A 코드 */}
      <div
        className={`transition-all duration-300 ${hoveredCode === 'A' ? 'w-[60%]' : hoveredCode === 'B' ? 'w-[40%]' : 'w-1/2'}`}
        onMouseEnter={() => handleHover('A')}
        onMouseLeave={handleLeave}
      >
        <CodeViewer code={aCode} language={language} team="A" isHovered={hoveredCode === 'A'} />
      </div>

      {/* B 코드 */}
      <div
        className={`transition-all duration-300 ${hoveredCode === 'B' ? 'w-[60%]' : hoveredCode === 'A' ? 'w-[40%]' : 'w-1/2'}`}
        onMouseEnter={() => handleHover('B')}
        onMouseLeave={handleLeave}
      >
        <CodeViewer code={bCode} language={language} team="B" isHovered={hoveredCode === 'B'} />
      </div>
    </div>
  );
}
