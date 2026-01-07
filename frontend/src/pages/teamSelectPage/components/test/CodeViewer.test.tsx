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

describe('CodeViewer', () => {
  const mockCode = 'function hello() { return "world"; }';

  it('렌더링된다', () => {
    render(<CodeViewer code={mockCode} language="javascript" team="A" />);

    expect(screen.getByTestId('syntax-highlighter')).toBeInTheDocument();
    expect(screen.getByText(mockCode)).toBeInTheDocument();
  });

  it('A팀은 파란색 테두리를 사용한다', () => {
    const { container } = render(<CodeViewer code={mockCode} language="javascript" team="A" />);

    const codeContainer = container.querySelector('[data-testid="code-viewer"]');
    expect(codeContainer).toHaveClass('border-[#2B7FFF]');
  });

  it('B팀은 빨간색 테두리를 사용한다', () => {
    const { container } = render(<CodeViewer code={mockCode} language="javascript" team="B" />);

    const codeContainer = container.querySelector('[data-testid="code-viewer"]');
    expect(codeContainer).toHaveClass('border-[#FB2C36]');
  });

  it('호버 시 확장 스타일이 적용된다', () => {
    const { container } = render(<CodeViewer code={mockCode} language="javascript" team="A" isHovered={true} />);

    const codeContainer = container.querySelector('[data-testid="code-viewer"]');
    expect(codeContainer).toHaveClass('w-[70%]');
  });

  it('호버하지 않을 때 기본 너비가 적용된다', () => {
    const { container } = render(<CodeViewer code={mockCode} language="javascript" team="A" isHovered={false} />);

    const codeContainer = container.querySelector('[data-testid="code-viewer"]');
    expect(codeContainer).toHaveClass('w-[50%]');
  });

  it('language prop이 syntax highlighter에 전달된다', () => {
    render(<CodeViewer code={mockCode} language="typescript" team="A" />);

    const highlighter = screen.getByTestId('syntax-highlighter');
    expect(highlighter).toHaveAttribute('data-language', 'typescript');
  });

  it('코드 내용이 표시된다', () => {
    const testCode = 'const x = 42;';
    render(<CodeViewer code={testCode} language="javascript" team="A" />);

    expect(screen.getByText(testCode)).toBeInTheDocument();
  });
});
