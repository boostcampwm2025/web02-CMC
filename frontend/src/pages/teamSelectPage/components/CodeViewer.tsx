import CodeViewer from '@/commons/components/CodeViewer';

interface CodeViewerProps {
  code: string;
  language: string;
  team: 'A' | 'B';
  isHovered?: boolean;
}

export default function TeamSelectCodeViewer({ code, language, team }: CodeViewerProps) {
  return (
    <CodeViewer
      code={code}
      language={language}
      team={team}
      minHeight="var(--code-compare-min-height)"
      data-testid="code-viewer"
    />
  );
}
