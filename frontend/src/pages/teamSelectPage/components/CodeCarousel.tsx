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
    <div className="flex items-center justify-center gap-4 w-full">
      {/* A 코드 */}
      <div onMouseEnter={() => handleHover('A')} onMouseLeave={handleLeave}>
        <CodeViewer code={aCode} language={language} team="A" isHovered={hoveredCode === 'A'} />
      </div>

      {/* B 코드 */}
      <div onMouseEnter={() => handleHover('B')} onMouseLeave={handleLeave}>
        <CodeViewer code={bCode} language={language} team="B" isHovered={hoveredCode === 'B'} />
      </div>
    </div>
  );
}
