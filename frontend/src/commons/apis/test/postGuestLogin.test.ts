import { describe, it, expect, vi, beforeEach } from 'vitest';
import fetchPostGuestLogin from '../postGuestLogin';

describe('fetchPostGuestLogin', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('정상 응답 시 id와 nickname을 반환한다', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'guest-1', nickname: '귀여운 레오' })
    } as Response);

    const result = await fetchPostGuestLogin('battle-123');

    expect(result).toEqual({ id: 'guest-1', nickname: '귀여운 레오' });
    expect(fetch).toHaveBeenCalledWith('/api/auth/guest/battle-123', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  });

  it('서버 에러 시 에러를 던진다', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({})
    } as Response);

    await expect(fetchPostGuestLogin('battle-123')).rejects.toThrow('비회원 로그인에 실패하였습니다.');
  });

  it('잘못된 응답 형식이면 에러를 던진다', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ invalid: true })
    } as Response);

    await expect(fetchPostGuestLogin('battle-123')).rejects.toThrow('잘못된 로그인 응답 형식입니다.');
  });
});
