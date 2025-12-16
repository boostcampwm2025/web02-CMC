import CodeViewer from './CodeViewer';
import CodeHeader from './CodeHeader';

interface CodeSectionProps {
  onViewChange: (view: 'split' | 'tab') => void;
  currentView: 'split' | 'tab';
  codeA: string;
  codeB: string;
  language: string;
}

export default function CodeSection({ onViewChange, currentView, codeA, codeB, language }: CodeSectionProps) {
  return (
    <section className="flex-1 flex flex-col bg-[#1E1E2F] rounded-lg overflow-hidden">
      <CodeHeader onViewChange={onViewChange} currentView={currentView} />
      <div className="flex gap-4 p-4 flex-1">
        <CodeViewer team="A" language={language} code={codeA} />
        <CodeViewer team="B" language={language} code={codeB} />
      </div>
    </section>
  );
}
