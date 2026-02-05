import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CodeHeader from '@/pages/battlePage/components/codeview/CodeHeader';

describe('CodeHeader', () => {
  const mockOnViewChange = vi.fn();
  const mockOnTabChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('스플릿 뷰와 탭 뷰 버튼을 렌더링한다', () => {
    render(
      <CodeHeader onViewChange={mockOnViewChange} currentView="split" currentTab="A" onTabChange={mockOnTabChange} />
    );

    expect(screen.getByRole('button', { name: '스플릿 뷰' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '탭 뷰' })).toBeInTheDocument();
  });

  it('currentView가 split일 때 스플릿 뷰 버튼이 활성화된다', () => {
    render(
      <CodeHeader onViewChange={mockOnViewChange} currentView="split" currentTab="A" onTabChange={mockOnTabChange} />
    );

    const splitButton = screen.getByRole('button', { name: '스플릿 뷰' });
    expect(splitButton.className).toContain('bg-[#FF6900]');
  });

  it('currentView가 tab일 때 탭 뷰 버튼이 활성화된다', () => {
    render(
      <CodeHeader onViewChange={mockOnViewChange} currentView="tab" currentTab="A" onTabChange={mockOnTabChange} />
    );

    const tabButton = screen.getByRole('button', { name: '탭 뷰' });
    expect(tabButton.className).toContain('bg-[#FF6900]');
  });

  it('스플릿 뷰 버튼 클릭 시 onViewChange("split")를 호출한다', async () => {
    const user = userEvent.setup();
    render(
      <CodeHeader onViewChange={mockOnViewChange} currentView="tab" currentTab="A" onTabChange={mockOnTabChange} />
    );

    await user.click(screen.getByRole('button', { name: '스플릿 뷰' }));
    expect(mockOnViewChange).toHaveBeenCalledWith('split');
  });

  it('탭 뷰 버튼 클릭 시 onViewChange("tab")를 호출한다', async () => {
    const user = userEvent.setup();
    render(
      <CodeHeader onViewChange={mockOnViewChange} currentView="split" currentTab="A" onTabChange={mockOnTabChange} />
    );

    await user.click(screen.getByRole('button', { name: '탭 뷰' }));
    expect(mockOnViewChange).toHaveBeenCalledWith('tab');
  });

  it('currentView가 tab일 때만 팀 선택 버튼이 표시된다', () => {
    const { rerender } = render(
      <CodeHeader onViewChange={mockOnViewChange} currentView="split" currentTab="A" onTabChange={mockOnTabChange} />
    );

    expect(screen.queryByRole('button', { name: 'A팀' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'B팀' })).not.toBeInTheDocument();

    rerender(
      <CodeHeader onViewChange={mockOnViewChange} currentView="tab" currentTab="A" onTabChange={mockOnTabChange} />
    );

    expect(screen.getByRole('button', { name: 'A팀' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'B팀' })).toBeInTheDocument();
  });

  it('A팀 버튼 클릭 시 onTabChange("A")를 호출한다', async () => {
    const user = userEvent.setup();
    render(
      <CodeHeader onViewChange={mockOnViewChange} currentView="tab" currentTab="B" onTabChange={mockOnTabChange} />
    );

    await user.click(screen.getByRole('button', { name: 'A팀' }));
    expect(mockOnTabChange).toHaveBeenCalledWith('A');
  });

  it('B팀 버튼 클릭 시 onTabChange("B")를 호출한다', async () => {
    const user = userEvent.setup();
    render(
      <CodeHeader onViewChange={mockOnViewChange} currentView="tab" currentTab="A" onTabChange={mockOnTabChange} />
    );

    await user.click(screen.getByRole('button', { name: 'B팀' }));
    expect(mockOnTabChange).toHaveBeenCalledWith('B');
  });

  it('currentTab이 A일 때 A팀 버튼이 활성화된다', () => {
    render(
      <CodeHeader onViewChange={mockOnViewChange} currentView="tab" currentTab="A" onTabChange={mockOnTabChange} />
    );

    const aTeamButton = screen.getByRole('button', { name: 'A팀' });
    expect(aTeamButton.className).toContain('bg-[#2B7FFF]');
  });

  it('currentTab이 B일 때 B팀 버튼이 활성화된다', () => {
    render(
      <CodeHeader onViewChange={mockOnViewChange} currentView="tab" currentTab="B" onTabChange={mockOnTabChange} />
    );

    const bTeamButton = screen.getByRole('button', { name: 'B팀' });
    expect(bTeamButton.className).toContain('bg-[#FB2C36]');
  });
});
