import { useState } from 'react';
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
  const [currentTab, setCurrentTab] = useState<'A' | 'B'>('A');

  return (
    <section className="w-[1194px] h-fit flex-1 flex flex-col bg-[#1E1E2F]  rounded-lg overflow-hidden">
      <CodeHeader
        onViewChange={onViewChange}
        currentView={currentView}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />
      <div className="flex gap-4 p-4 flex-1">
        {currentView === 'split' ? (
          <>
            <CodeViewer team="A" language={language} code={codeA} />
            <CodeViewer team="B" language={language} code={codeB} />
          </>
        ) : (
          <CodeViewer team={currentTab} language={language} code={currentTab === 'A' ? codeA : codeB} />
        )}
      </div>
    </section>
  );
}
