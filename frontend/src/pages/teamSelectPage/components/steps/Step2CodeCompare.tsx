import { Code2 } from 'lucide-react';
import CodeCarousel from '../CodeCarousel';

interface Step2CodeCompareProps {
  aCode: string;
  bCode: string;
  language: string;
}

export default function Step2CodeCompare({ aCode, bCode, language }: Step2CodeCompareProps) {
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-6xl mx-auto">
      {/* 상단 섹션 */}
      <div className="text-center mb-8">
        <Code2 className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">쟁점</h2>
        <p className="text-gray-400">두 구현의 코드를 비교하고 분석하세요</p>
      </div>

      {/* 중앙 컨테이너 */}
      <div className="w-full bg-[#0d0d1a]/50 rounded-2xl p-8 border border-[#1a1a2e]">
        <CodeCarousel aCode={aCode} bCode={bCode} language={language} />
      </div>
    </div>
  );
}
