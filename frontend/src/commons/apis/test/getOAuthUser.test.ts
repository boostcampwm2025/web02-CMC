import { describe, it, expect, vi, beforeEach } from 'vitest';
import getOAuthUser from '../getOAuthUser';

describe('getOAuthUser', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockOAuthResponse = {
    id: 'user-1',
    provider: 'github',
    providerId: '12345',
    nickname: '테스터',
    avatarUrl: 'https://example.com/avatar.png',
    tier: 'SILVER',
    rating: 250
  };

  it('정상 응답 시 AuthUser 객체를 반환한다', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockOAuthResponse
    } as Response);

    const user = await getOAuthUser();

    expect(user).toEqual({
      id: 'user-1',
      nickname: '테스터',
      type: 'oauth',
      provider: 'github',
      avatarUrl: 'https://example.com/avatar.png',
      tier: 'SILVER',
      rating: 250
    });
  });

  it('401 응답 시 에러를 던진다', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({})
    } as Response);

    await expect(getOAuthUser()).rejects.toThrow('잘못된 사용자 정보 형식입니다.');
  });

  it('서버 에러 시 에러를 던진다', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({})
    } as Response);

    await expect(getOAuthUser()).rejects.toThrow('사용자 정보를 가져오는데 실패했습니다.');
  });

  it('잘못된 응답 형식이면 에러를 던진다', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ invalid: 'data' })
    } as Response);

    await expect(getOAuthUser()).rejects.toThrow('잘못된 사용자 정보 형식입니다.');
  });
});
