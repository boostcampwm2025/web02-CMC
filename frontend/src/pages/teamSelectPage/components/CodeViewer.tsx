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
      containerClassName="w-full h-full"
      minHeight="100%"
      maxHeight="none"
      data-testid="code-viewer"
    />
  );
}
