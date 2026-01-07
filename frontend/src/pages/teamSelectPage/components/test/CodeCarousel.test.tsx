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

    // 초기에는 A 코드가 표시됨
    expect(screen.getByText(aCode)).toBeInTheDocument();
  });

  it('초기에는 A 코드가 표시된다', () => {
    render(<CodeCarousel aCode={aCode} bCode={bCode} language={language} />);

    expect(screen.getByText(aCode)).toBeInTheDocument();
    expect(screen.queryByText(bCode)).not.toBeInTheDocument();
  });

  it('좌우 화살표 버튼이 표시된다', () => {
    render(<CodeCarousel aCode={aCode} bCode={bCode} language={language} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('우측 화살표 클릭 시 B 코드로 전환된다', async () => {
    const user = userEvent.setup();
    render(<CodeCarousel aCode={aCode} bCode={bCode} language={language} />);

    const buttons = screen.getAllByRole('button');
    const rightButton = buttons[1]; // 두 번째 버튼이 우측 화살표

    await user.click(rightButton);

    expect(screen.queryByText(aCode)).not.toBeInTheDocument();
    expect(screen.getByText(bCode)).toBeInTheDocument();
  });

  it('좌측 화살표 클릭 시 A 코드로 전환된다', async () => {
    const user = userEvent.setup();
    render(<CodeCarousel aCode={aCode} bCode={bCode} language={language} />);

    const buttons = screen.getAllByRole('button');
    const rightButton = buttons[1];
    const leftButton = buttons[0];

    // 먼저 B로 이동
    await user.click(rightButton);
    expect(screen.getByText(bCode)).toBeInTheDocument();

    // 다시 A로 이동
    await user.click(leftButton);
    expect(screen.getByText(aCode)).toBeInTheDocument();
    expect(screen.queryByText(bCode)).not.toBeInTheDocument();
  });

  it('A↔B 양방향 전환이 가능하다', async () => {
    const user = userEvent.setup();
    render(<CodeCarousel aCode={aCode} bCode={bCode} language={language} />);

    const buttons = screen.getAllByRole('button');
    const leftButton = buttons[0];
    const rightButton = buttons[1];

    // A → B
    await user.click(rightButton);
    expect(screen.getByText(bCode)).toBeInTheDocument();

    // B → A
    await user.click(leftButton);
    expect(screen.getByText(aCode)).toBeInTheDocument();

    // A → B 다시
    await user.click(rightButton);
    expect(screen.getByText(bCode)).toBeInTheDocument();
  });

  it('현재 코드 인디케이터가 표시된다', () => {
    render(<CodeCarousel aCode={aCode} bCode={bCode} language={language} />);

    // 좌우 화살표 버튼 사이의 인디케이터 확인
    const indicator = screen.getByText((content, element) => {
      return !!(element?.className.includes('font-medium') && (content === 'A' || content === 'B'));
    });
    expect(indicator).toBeInTheDocument();
  });
});
