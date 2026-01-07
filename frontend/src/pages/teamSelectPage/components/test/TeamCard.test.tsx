import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TeamCard from '../TeamCard';

describe('TeamCard', () => {
  it('렌더링된다', () => {
    render(<TeamCard team="A" label="A팀" description="구현 A 지지" isSelected={false} onClick={() => {}} />);

    expect(screen.getByText('A팀')).toBeInTheDocument();
    expect(screen.getByText('구현 A 지지')).toBeInTheDocument();
  });

  it('클릭 시 onClick 콜백이 호출된다', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<TeamCard team="A" label="A팀" description="구현 A 지지" isSelected={false} onClick={handleClick} />);

    const card = screen.getByRole('button');
    await user.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('isSelected=true일 때 선택 스타일이 적용된다', () => {
    const { container } = render(
      <TeamCard team="A" label="A팀" description="구현 A 지지" isSelected={true} onClick={() => {}} />
    );

    const card = container.querySelector('button');
    expect(card).toHaveClass('border-[#2B7FFF]'); // A팀 선택 시 파란색
  });

  it('isSelected=false일 때 선택되지 않은 스타일이 적용된다', () => {
    const { container } = render(
      <TeamCard team="A" label="A팀" description="구현 A 지지" isSelected={false} onClick={() => {}} />
    );

    const card = container.querySelector('button');
    expect(card).toHaveClass('border-[#2D2D3F]'); // 미선택 시 회색
  });

  it('팀 A는 파란색 테마를 사용한다', () => {
    const { container } = render(
      <TeamCard team="A" label="A팀" description="구현 A 지지" isSelected={true} onClick={() => {}} />
    );

    const card = container.querySelector('button');
    expect(card).toHaveClass('border-[#2B7FFF]');
  });

  it('팀 B는 빨간색 테마를 사용한다', () => {
    const { container } = render(
      <TeamCard team="B" label="B팀" description="구현 B 지지" isSelected={true} onClick={() => {}} />
    );

    const card = container.querySelector('button');
    expect(card).toHaveClass('border-[#FB2C36]');
  });

  it('중립은 주황색 테마를 사용한다', () => {
    const { container } = render(
      <TeamCard team="NONE" label="중립" description="공정한 관찰자" isSelected={true} onClick={() => {}} />
    );

    const card = container.querySelector('button');
    expect(card).toHaveClass('border-[#FF6900]');
  });
});
