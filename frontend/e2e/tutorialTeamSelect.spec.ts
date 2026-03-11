import { test, expect } from '@playwright/test';

test.describe('튜토리얼 팀 선택 페이지 - 인트로 모달', () => {
  test('튜토리얼 페이지에 접근하면 팀 선택 안내 모달이 등장하며, 전환 버튼이 잘 동작한다', async ({ page }) => {
    await page.goto('/tutorial/team-select');

    const modal = page.locator('.fixed.inset-0').filter({ hasText: '튜토리얼' });

    await expect(modal.getByText('튜토리얼에 오신 것을 환영합니다!')).toBeVisible();
    await expect(modal.getByText('1 / 2')).toBeVisible();

    await modal.getByRole('button', { name: '다음' }).click();

    await expect(modal.getByText('진영 선택 튜토리얼')).toBeVisible();
    await expect(modal.getByText('2 / 2')).toBeVisible();
    await expect(modal.getByRole('button', { name: '시작하기' })).toBeVisible();
  });

  test('시작하기 클릭 시 모달이 닫히고 배틀 설명 카드가 노출된다', async ({ page }) => {
    await page.goto('/tutorial/team-select');

    const modal = page.locator('.fixed.inset-0').filter({ hasText: '튜토리얼' });
    await modal.getByRole('button', { name: '다음' }).click();
    await modal.getByRole('button', { name: '시작하기' }).click();

    await expect(page.getByText('튜토리얼에 오신 것을 환영합니다!')).not.toBeVisible();
    await expect(page.getByText('튜토리얼 참가하기')).toBeVisible();
  });
});
