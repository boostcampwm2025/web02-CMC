import { test, expect, type Page } from '@playwright/test';
import { injectOAuthUser } from './helpers/auth';
import { BATTLE_ID, MOCK_BATTLE_INFO } from './helpers/mockData';

const BATTLE_URL = `/battle/${BATTLE_ID}`;

async function setupBattlePage(page: Page) {
  await injectOAuthUser(page);
  await page.route(`**/api/battles/${BATTLE_ID}/join`, (route) =>
    route.fulfill({ status: 200, json: MOCK_BATTLE_INFO })
  );
  await page.goto(BATTLE_URL);
}

test.describe('배틀 페이지 - 렌더링', () => {
  test('코드 뷰어에 API 데이터가 렌더링된다', async ({ page }) => {
    await setupBattlePage(page);

    // language
    await expect(page.getByText('JavaScript').first()).toBeVisible();
    // 팀 레이블
    await expect(page.getByText('구현 A')).toBeVisible();
    await expect(page.getByText('구현 B')).toBeVisible();
    // aCode 내용
    await expect(page.getByText(/if \(condition\)/)).toBeVisible();
    // inviteCode 있을 때만 초대 링크 버튼 노출
    await expect(page.getByRole('button', { name: /초대 링크/ })).toBeVisible();
  });
});
