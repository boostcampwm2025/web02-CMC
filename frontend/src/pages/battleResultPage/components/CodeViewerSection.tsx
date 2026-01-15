import CodeViewer from '@/commons/components/CodeViewer';

interface CodeComparisonSectionProps {
  codeA: string;
  codeB: string;
  language: string;
}

export default function CodeViewerSection({ codeA, codeB, language }: CodeComparisonSectionProps) {
  return (
    <div className="max-w-7xl mx-auto mb-12">
      <div className="flex gap-2 items-center mb-6">
        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
        <h2 className="text-2xl font-bold">코드 비교</h2>
      </div>
      <div className="flex gap-4">
        <CodeViewer team="A" language={language} code={codeA} />
        <CodeViewer team="B" language={language} code={codeB} />
      </div>
    </div>
  );
}
