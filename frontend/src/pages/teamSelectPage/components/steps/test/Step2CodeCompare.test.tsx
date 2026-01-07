import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

    // 좌우 화살표 버튼이 있는지 확인
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('초기에는 A 코드가 표시된다', () => {
    render(<Step2CodeCompare aCode={aCode} bCode={bCode} language={language} />);

    expect(screen.getByText(aCode)).toBeInTheDocument();
    expect(screen.queryByText(bCode)).not.toBeInTheDocument();
  });

  it('화살표 클릭으로 코드를 전환할 수 있다', async () => {
    const user = userEvent.setup();
    render(<Step2CodeCompare aCode={aCode} bCode={bCode} language={language} />);

    const buttons = screen.getAllByRole('button');
    const rightButton = buttons[1];

    await user.click(rightButton);

    expect(screen.getByText(bCode)).toBeInTheDocument();
    expect(screen.queryByText(aCode)).not.toBeInTheDocument();
  });

  it('설명 텍스트가 표시된다', () => {
    render(<Step2CodeCompare aCode={aCode} bCode={bCode} language={language} />);

    expect(screen.getByText(/코드를 비교/)).toBeInTheDocument();
  });
});
