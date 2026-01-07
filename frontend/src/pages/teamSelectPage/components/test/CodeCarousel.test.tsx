import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CodeCarousel from '../CodeCarousel';

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

describe('CodeCarousel', () => {
  const aCode = 'function methodA() { return "A"; }';
  const bCode = 'function methodB() { return "B"; }';
  const language = 'javascript';

  it('렌더링된다', () => {
    render(<CodeCarousel aCode={aCode} bCode={bCode} language={language} />);

    // A와 B 코드가 모두 표시됨
    expect(screen.getByText(aCode)).toBeInTheDocument();
    expect(screen.getByText(bCode)).toBeInTheDocument();
  });

  it('A와 B 코드가 동시에 표시된다', () => {
    render(<CodeCarousel aCode={aCode} bCode={bCode} language={language} />);

    expect(screen.getByText(aCode)).toBeInTheDocument();
    expect(screen.getByText(bCode)).toBeInTheDocument();
  });

  it('두 개의 CodeViewer가 렌더링된다', () => {
    render(<CodeCarousel aCode={aCode} bCode={bCode} language={language} />);

    const codeViewers = screen.getAllByTestId('code-viewer');
    expect(codeViewers).toHaveLength(2);
  });

  it('A 코드 호버 시 확대된다', async () => {
    const user = userEvent.setup();
    render(<CodeCarousel aCode={aCode} bCode={bCode} language={language} />);

    const codeViewers = screen.getAllByTestId('code-viewer');
    const aViewer = codeViewers[0];

    await user.hover(aViewer.parentElement!);

    // 호버 효과로 인해 너비가 변경됨
    expect(aViewer).toBeInTheDocument();
  });

  it('B 코드 호버 시 확대된다', async () => {
    const user = userEvent.setup();
    render(<CodeCarousel aCode={aCode} bCode={bCode} language={language} />);

    const codeViewers = screen.getAllByTestId('code-viewer');
    const bViewer = codeViewers[1];

    await user.hover(bViewer.parentElement!);

    // 호버 효과로 인해 너비가 변경됨
    expect(bViewer).toBeInTheDocument();
  });

  it('마우스 떠날 때 원래 크기로 돌아온다', async () => {
    const user = userEvent.setup();
    render(<CodeCarousel aCode={aCode} bCode={bCode} language={language} />);

    const codeViewers = screen.getAllByTestId('code-viewer');
    const aViewer = codeViewers[0];

    await user.hover(aViewer.parentElement!);
    await user.unhover(aViewer.parentElement!);

    expect(aViewer).toBeInTheDocument();
  });

  it('양쪽 코드가 각각 독립적으로 호버 가능하다', async () => {
    const user = userEvent.setup();
    render(<CodeCarousel aCode={aCode} bCode={bCode} language={language} />);

    const codeViewers = screen.getAllByTestId('code-viewer');

    await user.hover(codeViewers[0].parentElement!);
    expect(codeViewers[0]).toBeInTheDocument();

    await user.hover(codeViewers[1].parentElement!);
    expect(codeViewers[1]).toBeInTheDocument();
  });
});
