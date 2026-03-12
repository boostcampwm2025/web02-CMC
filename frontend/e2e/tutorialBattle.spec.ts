import { test, expect, type Page } from '@playwright/test';

const PHASE_TIMEOUT = 5000;


async function completeTutorialSteps(page: Page) {
  for (let step = 1; step <= 9; step++) {
    await expect(page.getByText(`${step} / 9`)).toBeVisible();
    if (step < 9) {
       await page.locator('button').filter({ hasText: /^다음/ }).first().evaluate(el => (el as HTMLButtonElement).click());
    }
  }
  await page.getByRole('button', { name: /이전/ }).click();
  await expect(page.getByText('8 / 9')).toBeVisible();
  await page.locator('button').filter({ hasText: /^다음/ }).first().evaluate(el => (el as HTMLButtonElement).click());
  await expect(page.getByText('9 / 9')).toBeVisible();
  await page.locator('button').filter({ hasText: /^완료/ }).first().evaluate(el => (el as HTMLButtonElement).click());
}

async function doPhase(page: Page, inputPlaceholder: string, submitButtonName: string) {
  const input = page.getByPlaceholder(inputPlaceholder);
  await expect(input).toBeVisible({ timeout: PHASE_TIMEOUT });
  await input.fill('테스트 입력');
  await page.getByRole('button', { name: submitButtonName }).click();

  const voteItem = page.locator('[data-tutorial="vote"] button').first();
  await expect(voteItem).toBeVisible({ timeout: PHASE_TIMEOUT });
  await voteItem.click();
}

async function doDefensePhase(page: Page) {
  await expect(page.getByText('이의제기!!')).toBeVisible({ timeout: PHASE_TIMEOUT });
  await page.getByRole('dialog').click();
  await expect(page.getByText('이의제기!!')).not.toBeVisible();

  await doPhase(page, '상대 주장에 논리적으로 반박해 보세요', '반론');
}

test.describe('튜토리얼 배틀 페이지 - 9단계 안내 모달', () => {
 
});

test.describe('튜토리얼 배틀 페이지 - 실전 연습 플로우가 잘 진행되고 마무리 되는지 검증', () => {
 test('튜토리얼 페이지 입장시 게임 안내 모달이 등장하며, 다음/이전 전환이 매끄럽고 완료 시 닫히는지?', async ({ page }) => {
    await page.goto('/tutorial/battle');
    await completeTutorialSteps(page);
  });

  test('2번의 페이즈가 진행되는 동안 체크리스트/이펙트/투표목록 검증 후 팀변경/튜토리얼이 잘 마무리되는지', async ({ page }) => {
    await page.goto('/tutorial/battle');
    await completeTutorialSteps(page);

    await expect(page.getByText('실전 연습')).toBeVisible({ timeout: PHASE_TIMEOUT });

    // ── 1회차 공격 페이즈 이의제기 입력 후 투표까지 진행 검증
    const attackSubmitDot = page.locator('li').filter({ hasText: '이의제기 1개 작성하기' }).locator('span').first();
    const attackVoteDot = page.locator('li').filter({ hasText: '투표 1회 하기' }).locator('span').first();
    await expect(attackSubmitDot).toHaveClass(/bg-gray-500/);
    await expect(attackVoteDot).toHaveClass(/bg-gray-500/);

    const attackInput = page.getByPlaceholder('상대 코드의 허점을 찾아 이의 제기하세요');
    await expect(attackInput).toBeVisible({ timeout: PHASE_TIMEOUT });
    await attackInput.fill('테스트 입력');
    await page.getByRole('button', { name: '이의제기' }).click();
    await expect(attackSubmitDot).toHaveClass(/bg-emerald-400/);

    await expect(page.getByText('제출된 이의제기 목록')).toBeVisible();
    await expect(page.getByText('테스트 입력')).toBeVisible();

    const attackVoteItem = page.locator('[data-tutorial="vote"] button').first();
    await expect(attackVoteItem).toBeVisible({ timeout: PHASE_TIMEOUT });
    await attackVoteItem.click();

    // ── 1회차 방어 페이즈 반론 입력 후 투표까지 진행 검증
    await expect(page.getByText('방어(반론) 턴')).toBeVisible({ timeout: PHASE_TIMEOUT });

    const defenseSubmitDot = page.locator('li').filter({ hasText: '반론 1개 작성하기' }).locator('span').first();
    const defenseVoteDot = page.locator('li').filter({ hasText: '투표 1회 하기' }).locator('span').first();
    await expect(defenseSubmitDot).toHaveClass(/bg-gray-500/);
    await expect(defenseVoteDot).toHaveClass(/bg-gray-500/);

    const defenseInput = page.getByPlaceholder('상대 주장에 논리적으로 반박해 보세요');
    await expect(defenseInput).toBeVisible({ timeout: PHASE_TIMEOUT });
    await defenseInput.fill('테스트 입력');
    await page.getByRole('button', { name: '반론' }).click();
    await expect(defenseSubmitDot).toHaveClass(/bg-emerald-400/);

    await expect(page.getByText('제출된 반론 목록')).toBeVisible();
    await expect(page.getByText('테스트 입력')).toBeVisible();

    const defenseVoteItem = page.locator('[data-tutorial="vote"] button').first();
    await expect(defenseVoteItem).toBeVisible({ timeout: PHASE_TIMEOUT });
    await defenseVoteItem.click();

    // ── 2회차 공격/방어 페이즈 검증
    await doPhase(page, '상대 코드의 허점을 찾아 이의 제기하세요', '이의제기');
    await doDefensePhase(page);

    // ── 팀 변경 이후 메인 페이지로 라우팅 되는지
    await expect(page.getByRole('button', { name: 'B팀' }).first()).toBeVisible({ timeout: PHASE_TIMEOUT });
    await page.getByRole('button', { name: 'B팀' }).first().click();
    await expect(page).toHaveURL('/main', { timeout: 10000 });
  });
});
