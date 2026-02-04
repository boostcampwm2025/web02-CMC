import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import InviteLinkButton from '../InviteLinkButton';

Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined)
  }
});

describe('InviteLinkButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockInviteCode = 'testInviteCode123';

  it('친구 초대 버튼이 렌더링된다', () => {
    render(<InviteLinkButton inviteCode={mockInviteCode} />);

    const button = screen.getByTitle('링크 복사');
    expect(button).toBeInTheDocument();
  });

  it('버튼 클릭 시 클립보드에 링크가 복사된다', async () => {
    render(<InviteLinkButton inviteCode={mockInviteCode} />);

    const button = screen.getByTitle('링크 복사');
    fireEvent.click(button);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(`${window.location.origin}/battles/${mockInviteCode}`);
    });
  });

  it('복사 성공 시 "복사됨" 텍스트가 표시된다', async () => {
    render(<InviteLinkButton inviteCode={mockInviteCode} />);

    const button = screen.getByTitle('링크 복사');
    fireEvent.click(button);

    await waitFor(() => {
      const copiedText = screen.getByText('복사됨');
      expect(copiedText).toBeInTheDocument();
    });
  });
});
