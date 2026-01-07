import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Step2CodeCompare from '../Step2CodeCompare';

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

describe('Step2CodeCompare', () => {
  const aCode = 'async function fetchData() { return await fetch(url); }';
  const bCode = 'function fetchData() { return new Promise(...); }';
  const language = 'javascript';

  it('렌더링된다', () => {
    render(<Step2CodeCompare aCode={aCode} bCode={bCode} language={language} />);

    expect(screen.getByText(aCode)).toBeInTheDocument();
  });

  it('CodeCarousel 컴포넌트를 사용한다', () => {
    render(<Step2CodeCompare aCode={aCode} bCode={bCode} language={language} />);

    // A와 B 코드가 모두 표시되는지 확인
    expect(screen.getByText(aCode)).toBeInTheDocument();
    expect(screen.getByText(bCode)).toBeInTheDocument();
  });

  it('A와 B 코드가 동시에 표시된다', () => {
    render(<Step2CodeCompare aCode={aCode} bCode={bCode} language={language} />);

    expect(screen.getByText(aCode)).toBeInTheDocument();
    expect(screen.getByText(bCode)).toBeInTheDocument();
  });

  it('두 개의 CodeViewer가 렌더링된다', () => {
    render(<Step2CodeCompare aCode={aCode} bCode={bCode} language={language} />);

    const codeViewers = screen.getAllByTestId('code-viewer');
    expect(codeViewers).toHaveLength(2);
  });

  it('설명 텍스트가 표시된다', () => {
    render(<Step2CodeCompare aCode={aCode} bCode={bCode} language={language} />);

    expect(screen.getByText(/두 구현의 코드를 비교/)).toBeInTheDocument();
  });
});
