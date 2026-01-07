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

export default function CodeViewer({ code, language, team, isHovered = false }: CodeViewerProps) {
  const teamStyle = TEAM_STYLES[team];
  const width = isHovered ? 'w-[70%]' : 'w-[50%]';

  return (
    <div
      data-testid="code-viewer"
      className={`
        ${width}
        border-2
        ${teamStyle.border}
        rounded-lg
        overflow-hidden
        transition-all
        duration-300
        ease-in-out
      `}
      style={{ willChange: 'width' }}
    >
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: '#1E1E2F',
          fontSize: '14px',
          maxHeight: '400px',
          overflow: 'auto'
        }}
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
