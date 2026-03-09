import { test, expect } from '@playwright/test';
import { injectOAuthUser, mockUnauthenticated } from './helpers/auth';

test.describe('메인 페이지 - 새 배틀 생성 버튼', () => {
  test('비로그인 상태에서 새 배틀 생성 버튼 클릭 시 경고 toast가 표시된다', async ({ page }) => {
    await mockUnauthenticated(page);
    await page.goto('/main');

    await page.getByRole('button', { name: '새 배틀 생성' }).click();

    await expect(page.getByText('로그인 후 이용 가능합니다.')).toBeVisible();
  });

  test('로그인 상태에서 새 배틀 생성 버튼 클릭 시 /battle/create로 이동한다', async ({ page }) => {
    await injectOAuthUser(page);
    await page.goto('/main');

    await page.getByRole('button', { name: '새 배틀 생성' }).click();

    await expect(page).toHaveURL('/battle/create');
  });
});
