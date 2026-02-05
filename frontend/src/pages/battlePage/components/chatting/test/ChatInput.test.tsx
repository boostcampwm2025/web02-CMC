import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInput from '@/pages/battlePage/components/chatting/ChatInput';

vi.mock('@/assets/icon/send.svg?react', () => ({
  default: () => <svg data-testid="send-icon" />
}));

describe('ChatInput', () => {
  const mockOnSend = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('입력 필드와 전송 버튼을 렌더링한다', () => {
    render(<ChatInput onSend={mockOnSend} />);

    expect(screen.getByPlaceholderText('메시지를 입력하세요...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByTestId('send-icon')).toBeInTheDocument();
  });

  it('입력 필드 값이 변경된다', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByPlaceholderText('메시지를 입력하세요...');
    await user.type(input, 'Hello World');

    expect(input).toHaveValue('Hello World');
  });

  it('전송 버튼 클릭 시 onSend가 입력값과 함께 호출된다', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByPlaceholderText('메시지를 입력하세요...');
    await user.type(input, 'Test message');
    await user.click(screen.getByRole('button'));

    expect(mockOnSend).toHaveBeenCalledWith('Test message');
  });

  it('전송 후 입력 필드가 비워진다', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByPlaceholderText('메시지를 입력하세요...');
    await user.type(input, 'Test message');
    await user.click(screen.getByRole('button'));

    expect(input).toHaveValue('');
  });

  it('빈 입력값에서는 onSend가 호출되지 않는다', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={mockOnSend} />);

    await user.click(screen.getByRole('button'));

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('Enter 키 입력 시 메시지가 전송된다', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByPlaceholderText('메시지를 입력하세요...');
    await user.type(input, 'Enter test{enter}');

    expect(mockOnSend).toHaveBeenCalledWith('Enter test');
  });

  it('빈 입력값에서 Enter 키 입력 시 onSend가 호출되지 않는다', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByPlaceholderText('메시지를 입력하세요...');
    await user.type(input, '{enter}');

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('입력 필드에 placeholder가 표시된다', () => {
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByPlaceholderText('메시지를 입력하세요...');
    expect(input).toBeInTheDocument();
  });
});
