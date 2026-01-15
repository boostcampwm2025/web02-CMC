import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CodeSection from '@/pages/battlePage/components/codeview/CodeSection';

vi.mock('@/pages/battlePage/components/codeview/CodeViewer', () => ({
  default: ({ team, language, code }: { team: 'A' | 'B'; language: string; code: string }) => (
    <div data-testid={`code-viewer-${team}`}>
      <span>구현 {team}</span>
      <span>{language}</span>
      <pre>{code}</pre>
    </div>
  )
}));

describe('CodeSection', () => {
  const mockCodeA = 'function teamA() {\n  return "A";\n}';
  const mockCodeB = 'function teamB() {\n  return "B";\n}';
  const mockOnViewChange = vi.fn();

  it('split 뷰에서 A, B 코드 모두 렌더링', () => {
    render(
      <CodeSection
        onViewChange={mockOnViewChange}
        currentView="split"
        codeA={mockCodeA}
        codeB={mockCodeB}
        language="JavaScript"
      />
    );

    expect(screen.getByTestId('code-viewer-A')).toBeInTheDocument();
    expect(screen.getByTestId('code-viewer-B')).toBeInTheDocument();
    expect(screen.getByText(/function teamA/)).toBeInTheDocument();
    expect(screen.getByText(/function teamB/)).toBeInTheDocument();
  });

  it('tab 뷰에서 현재 탭 코드만 렌더링 (기본 A팀)', () => {
    render(
      <CodeSection
        onViewChange={mockOnViewChange}
        currentView="tab"
        codeA={mockCodeA}
        codeB={mockCodeB}
        language="JavaScript"
      />
    );

    expect(screen.getByTestId('code-viewer-A')).toBeInTheDocument();
    expect(screen.queryByTestId('code-viewer-B')).not.toBeInTheDocument();
    expect(screen.getByText(/function teamA/)).toBeInTheDocument();
  });

  it('tab 뷰에서 B팀 탭 클릭 시 B 코드로 전환', async () => {
    const user = userEvent.setup();
    render(
      <CodeSection
        onViewChange={mockOnViewChange}
        currentView="tab"
        codeA={mockCodeA}
        codeB={mockCodeB}
        language="JavaScript"
      />
    );

    const bTeamButton = screen.getByRole('button', { name: 'B팀' });
    await user.click(bTeamButton);

    expect(screen.getByTestId('code-viewer-B')).toBeInTheDocument();
    expect(screen.queryByTestId('code-viewer-A')).not.toBeInTheDocument();
    expect(screen.getByText(/function teamB/)).toBeInTheDocument();
  });

  it('split 뷰에서는 A/B 탭 버튼이 표시되지 않음', () => {
    render(
      <CodeSection
        onViewChange={mockOnViewChange}
        currentView="split"
        codeA={mockCodeA}
        codeB={mockCodeB}
        language="JavaScript"
      />
    );

    expect(screen.queryByRole('button', { name: 'A팀' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'B팀' })).not.toBeInTheDocument();
  });

  it('tab 뷰에서는 A/B 탭 버튼이 표시됨', () => {
    render(
      <CodeSection
        onViewChange={mockOnViewChange}
        currentView="tab"
        codeA={mockCodeA}
        codeB={mockCodeB}
        language="JavaScript"
      />
    );

    expect(screen.getByRole('button', { name: 'A팀' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'B팀' })).toBeInTheDocument();
  });
});
