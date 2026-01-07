import CodeCarousel from '../CodeCarousel';

interface Step2CodeCompareProps {
  aCode: string;
  bCode: string;
  language: string;
}

export default function Step2CodeCompare({ aCode, bCode, language }: Step2CodeCompareProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">코드를 비교해보세요</h3>
        <p className="text-[#99A1AF]">좌우 화살표로 A와 B 코드를 전환하며 비교할 수 있습니다</p>
      </div>

      <CodeCarousel aCode={aCode} bCode={bCode} language={language} />
    </div>
  );
}
