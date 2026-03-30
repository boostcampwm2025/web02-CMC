import Icon from '@/commons/components/Icon';
import CodeCarousel from '../CodeCarousel';

interface Step2CodeCompareProps {
  aCode: string;
  bCode: string;
  language: string;
}

export default function Step2CodeCompare({ aCode, bCode, language }: Step2CodeCompareProps) {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-6xl mx-auto px-4">
      <div className="text-center mb-4">
        <Icon name="code2" className="code-compare-icon-size text-orange-500 mx-auto mb-2" />
        <h2 className="code-compare-title-size font-bold text-white mb-1">쟁점</h2>
        <p className="code-compare-desc-size text-gray-400">두 구현의 코드를 비교하고 분석하세요</p>
      </div>

      <div className="w-full bg-[#0d0d1a]/50 rounded-lg border border-[#1a1a2e] code-compare-container-padding">
        <CodeCarousel aCode={aCode} bCode={bCode} min-Height="var(--code-compare-min-height)" language={language} />
      </div>
    </div>
  );
}
