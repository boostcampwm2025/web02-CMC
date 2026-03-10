import type { Page } from '@playwright/test';

const OAUTH_KEY = 'CMC_OAUTH_USER';

export interface MockOAuthUser {
  id: string;
  nickname: string;
  type: 'oauth';
  provider: 'github' | 'kakao';
  avatarUrl?: string;
  tier?: string;
  rating?: number;
}

export const DEFAULT_OAUTH_USER: MockOAuthUser = {
  id: 'test-user-id',
  nickname: '테스트유저',
  type: 'oauth',
  provider: 'github',
  tier: 'BRONZE',
  rating: 0,
};

/** 인증된 OAuth 유저 상태 주입 */
export async function injectOAuthUser(page: Page, user: MockOAuthUser = DEFAULT_OAUTH_USER): Promise<void> {
  await page.addInitScript(
    ({ key, value }: { key: string; value: MockOAuthUser }) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    { key: OAUTH_KEY, value: user }
  );
}

/** 미인증 상태 - /api/auth/me 401 mock */
export async function mockUnauthenticated(page: Page): Promise<void> {
  await page.route('**/api/auth/me', (route) =>
    route.fulfill({ status: 401, body: JSON.stringify({ message: 'Unauthorized' }) })
  );
}
