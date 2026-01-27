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

  it('초대 링크가 올바르게 렌더링된다', () => {
    render(<InviteLinkButton inviteCode={mockInviteCode} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe(`${window.location.origin}/battles/${mockInviteCode}`);
  });

  it('복사 버튼이 렌더링된다', () => {
    render(<InviteLinkButton inviteCode={mockInviteCode} />);

    const copyButton = screen.getByRole('button', { name: /복사/i });
    expect(copyButton).toBeInTheDocument();
  });

  it('복사 버튼 클릭 시 클립보드에 링크가 복사된다', async () => {
    render(<InviteLinkButton inviteCode={mockInviteCode} />);

    const copyButton = screen.getByRole('button', { name: /복사/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(`${window.location.origin}/battles/${mockInviteCode}`);
    });
  });

  it('복사 성공 시 "복사됨" 텍스트가 표시된다', async () => {
    render(<InviteLinkButton inviteCode={mockInviteCode} />);

    const copyButton = screen.getByRole('button', { name: /복사/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('복사됨')).toBeInTheDocument();
    });
  });
});
