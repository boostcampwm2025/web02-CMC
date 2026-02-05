import { describe, it, expect, vi, beforeEach } from 'vitest';
import logout from '../postLogout';

describe('logout', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('정상 응답 시 success를 반환한다', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    } as Response);

    const result = await logout();

    expect(result).toEqual({ success: true });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/auth/logout'), {
      method: 'POST',
      credentials: 'include'
    });
  });

  it('서버 에러 시 에러를 던진다', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({})
    } as Response);

    await expect(logout()).rejects.toThrow('로그아웃에 실패했습니다.');
  });

  it('잘못된 응답 형식이면 에러를 던진다', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ invalid: true })
    } as Response);

    await expect(logout()).rejects.toThrow('잘못된 로그아웃 응답 형식입니다.');
  });
});
