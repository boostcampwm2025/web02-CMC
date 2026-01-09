import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeViewerProps {
  code: string;
  language: string;
  team: 'A' | 'B';
  isHovered?: boolean;
}

const TEAM_STYLES = {
  A: {
    border: 'border-[#2B7FFF]',
    bg: 'bg-[#1C398E]'
  },
  B: {
    border: 'border-[#FB2C36]',
    bg: 'bg-[#82181A]'
  }
};

export default function CodeViewer({ code, language, team }: CodeViewerProps) {
  const teamStyle = TEAM_STYLES[team];

  return (
    <div
      data-testid="code-viewer"
      className={`
        w-full
        h-full
        border-2
        ${teamStyle.border}
        rounded-lg
        overflow-hidden
      `}
    >
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: '#1E1E2F',
          fontSize: '14px',
          minHeight: '500px',
          maxHeight: '600px',
          overflow: 'auto'
        }}
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
