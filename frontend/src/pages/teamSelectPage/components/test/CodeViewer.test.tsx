import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CodeViewer from '../CodeViewer';

// react-syntax-highlighter mock
vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children, language }: { children: string; language: string }) => (
    <pre data-testid="syntax-highlighter" data-language={language}>
      {children}
    </pre>
  )
}));

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  vscDarkPlus: {}
}));

vi.mock('@/commons/utils/languageMapper', () => ({
  languageMapper: (lang: string) => {
    const map: Record<string, string> = {
      TS: 'typescript',
      JS: 'javascript',
      PYTHON: 'python'
    };
    return map[lang] || lang;
  }
}));

describe('CodeViewer', () => {
  const mockCode = 'function hello() { return "world"; }';

  it('렌더링된다', () => {
    render(<CodeViewer code={mockCode} language="javascript" team="A" />);

    expect(screen.getByTestId('syntax-highlighter')).toBeInTheDocument();
    expect(screen.getByText(mockCode)).toBeInTheDocument();
  });

  it('data-testid가 code-viewer로 설정된다', () => {
    const { container } = render(<CodeViewer code={mockCode} language="javascript" team="A" />);

    const codeContainer = container.querySelector('[data-testid="code-viewer"]');
    expect(codeContainer).toBeInTheDocument();
  });

  it('전체 너비를 사용한다', () => {
    const { container } = render(<CodeViewer code={mockCode} language="javascript" team="A" />);

    const codeContainer = container.querySelector('[data-testid="code-viewer"]');
    expect(codeContainer).toHaveClass('w-full');
  });

  it('language prop이 syntax highlighter에 전달된다', () => {
    render(<CodeViewer code={mockCode} language="TS" team="A" />);

    const highlighter = screen.getByTestId('syntax-highlighter');
    expect(highlighter).toHaveAttribute('data-language', 'typescript');
  });

  it('코드 내용이 표시된다', () => {
    const testCode = 'const x = 42;';
    render(<CodeViewer code={testCode} language="javascript" team="A" />);

    expect(screen.getByText(testCode)).toBeInTheDocument();
  });
});
