import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { languageMapper } from '@/commons/utils/languageMapper';

interface CodeViewerProps {
  code: string;
  language: string;
  team: 'A' | 'B';
  containerClassName?: string;
  minHeight?: string;
  maxHeight?: string;
  'data-testid'?: string;
}

export default function CodeViewer({
  code,
  language,
  containerClassName,
  minHeight = '300px',
  maxHeight = '600px',
  'data-testid': dataTestId
}: CodeViewerProps) {
  const syntaxLanguage = languageMapper(language);

  return (
    <div data-testid={dataTestId} className={`${containerClassName || 'w-full h-full'}  overflow-hidden `}>
      <SyntaxHighlighter
        language={syntaxLanguage}
        style={vscDarkPlus}
        showLineNumbers
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: '#1E1E2F',
          fontSize: '14px',
          minHeight,
          maxHeight,
          overflow: 'auto'
        }}
        PreTag={({ children, ...props }: any) => (
          <pre {...props} className="custom-scrollbar">
            {children}
          </pre>
        )}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
