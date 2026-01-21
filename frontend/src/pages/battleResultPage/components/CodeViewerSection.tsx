import CodeViewer from '@/commons/components/CodeViewer';
import TrophyIcon from '@/assets/icon/trophy.svg?react';

interface CodeComparisonSectionProps {
  codeA: string;
  codeB: string;
  language: string;
  winner?: 'A' | 'B' | 'DRAW';
}

export default function CodeViewerSection({ codeA, codeB, language, winner }: CodeComparisonSectionProps) {
  return (
    <div className="max-w-7xl mx-auto mb-12">
      <div className="flex gap-2 items-center mb-6">
        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
        <h2 className="text-2xl font-bold">코드 비교</h2>
      </div>
      <div className="flex gap-4">
        <div className="rounded-xl border-[1px] border-blue-500 flex-1 overflow-hidden">
          <div className="flex justify-between items-center bg-[#1C398E]/50 px-6 h-[60px] text-[#8EC5FF] text-[16px]">
            <span>{language}</span>
            <span className="flex gap-2 items-center">
              {winner === 'A' && <TrophyIcon className="w-[20px] h-[20px]" />}
              <span>구현 A</span>
            </span>
          </div>
          <CodeViewer team="A" language={language} code={codeA} containerClassName="border-t-[1px] border-blue-500" />
        </div>
        <div className="rounded-xl border-[1px] border-red-600 flex-1 overflow-hidden">
          <div className="flex justify-between items-center bg-[#82181A]/50 px-6 h-[60px] text-[#FFA2A2] text-[16px]">
            <span>{language}</span>
            <span className="flex gap-2 items-center">
              {winner === 'B' && <TrophyIcon className="w-[20px] h-[20px]" />}
              <span>구현 B</span>
            </span>
          </div>
          <CodeViewer team="B" language={language} code={codeB} containerClassName="border-t-[1px] border-red-600" />
        </div>
      </div>
    </div>
  );
}
