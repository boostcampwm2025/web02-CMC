import { test, expect, type Page } from '@playwright/test';

const PHASE_TIMEOUT = 10000;

async function navigateToBattle(page: Page) {
  await page.goto('/tutorial/team-select');

  const modal = page.locator('.fixed.inset-0').filter({ hasText: '튜토리얼' });
  await modal.getByRole('button', { name: '다음' }).click();
  await modal.getByRole('button', { name: '시작하기' }).click();

  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: '다음 단계' }).click();
  }

  await page.getByRole('button', { name: 'A팀' }).click();
  await page.getByRole('button', { name: '진영 선택 완료' }).click();
  await page.waitForURL('/tutorial/battle');
}

test.describe('튜토리얼 배틀 페이지 - 9단계 안내 모달', () => {
  test('튜토리얼 페이지 입장시 게임 안내 모달이 등장하며, 다음/이전 전환이 매끄럽고 완료 시 닫히는지?', async ({ page }) => {
    await navigateToBattle(page);

    await expect(page.getByText('현재 페이즈 안내')).toBeVisible();
    await expect(page.getByText('1 / 9')).toBeVisible();

    // 다음 버튼으로 1 -> 9단계 순서대로 전환
    for (let step = 1; step <= 9; step++) {
      await expect(page.getByText(`${step} / 9`)).toBeVisible();
      if (step < 9) {
        await page.getByRole('button', { name: '다음' }).click({ force: true });
      }
    }

    // 이전 버튼으로 9 -> 8단계로 돌아가기
    await page.getByRole('button', { name: '이전' }).click({ force: true });
    await expect(page.getByText('8 / 9')).toBeVisible();

    // 다시 9단계로 이동 후 완료 시 모달 닫힘 확인
    await page.getByRole('button', { name: '다음' }).click({ force: true });
    await expect(page.getByText('9 / 9')).toBeVisible();
    await page.getByRole('button', { name: '완료' }).click({ force: true });
    await expect(page.getByText('9 / 9')).not.toBeVisible();
  });
});


