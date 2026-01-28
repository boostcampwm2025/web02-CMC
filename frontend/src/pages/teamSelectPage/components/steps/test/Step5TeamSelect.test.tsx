import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Step5TeamSelect from '../Step5TeamSelect';

describe('Step5TeamSelect', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('렌더링된다', () => {
    render(<Step5TeamSelect onSelect={mockOnSelect} />);

    expect(screen.getByText('A팀')).toBeInTheDocument();
    expect(screen.getByText('중립')).toBeInTheDocument();
    expect(screen.getByText('B팀')).toBeInTheDocument();
  });

  it('3개의 팀 카드가 모두 표시된다', () => {
    render(<Step5TeamSelect onSelect={mockOnSelect} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });

  it('A팀 카드 클릭 시 onSelect가 호출된다', async () => {
    const user = userEvent.setup();
    render(<Step5TeamSelect onSelect={mockOnSelect} />);

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]); // 첫 번째 버튼은 A팀

    expect(mockOnSelect).toHaveBeenCalledWith('A');
  });

  it('중립 카드 클릭 시 onSelect가 호출된다', async () => {
    const user = userEvent.setup();
    render(<Step5TeamSelect onSelect={mockOnSelect} />);

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[1]); // 두 번째 버튼은 중립

    expect(mockOnSelect).toHaveBeenCalledWith('NONE');
  });

  it('B팀 카드 클릭 시 onSelect가 호출된다', async () => {
    const user = userEvent.setup();
    render(<Step5TeamSelect onSelect={mockOnSelect} />);

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[2]); // 세 번째 버튼은 B팀

    expect(mockOnSelect).toHaveBeenCalledWith('B');
  });

  it('선택된 팀이 강조 표시된다', () => {
    const { container } = render(<Step5TeamSelect onSelect={mockOnSelect} selectedTeam="A" />);

    const buttons = container.querySelectorAll('button');
    const selectedButton = Array.from(buttons).find((btn) => btn.className.includes('border-[#2B7FFF]'));

    expect(selectedButton).toBeInTheDocument();
  });

  it('선택되지 않은 팀은 기본 스타일을 가진다', () => {
    const { container } = render(<Step5TeamSelect onSelect={mockOnSelect} selectedTeam="A" />);

    const buttons = container.querySelectorAll('button');
    const unselectedButtons = Array.from(buttons).filter((btn) => btn.className.includes('border-[#2D2D3F]'));

    expect(unselectedButtons.length).toBeGreaterThan(0);
  });

  it('설명 텍스트가 표시된다', () => {
    render(<Step5TeamSelect onSelect={mockOnSelect} />);

    expect(screen.getByText('진영 선택')).toBeInTheDocument();
  });
});
