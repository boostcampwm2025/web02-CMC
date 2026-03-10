import { test, expect } from '@playwright/test';
import { injectOAuthUser } from './helpers/auth';

test.describe('배틀 생성 페이지 - 폼 렌더링', () => {
  test('페이지 진입 시 필수 입력 필드와 버튼이 렌더링된다', async ({ page }) => {
    await injectOAuthUser(page);
    await page.goto('/battle/create');

    await expect(page.getByRole('heading', { name: '새 배틀 생성' })).toBeVisible();
    await expect(page.getByPlaceholder('예: 배열에서 중복 제거하기')).toBeVisible();
    await expect(page.getByPlaceholder('어떤 코드를 비교하고 싶으신가요?')).toBeVisible();
    await expect(page.getByPlaceholder('첫 번째 코드를 입력하세요')).toBeVisible();
    await expect(page.getByPlaceholder('두 번째 코드를 입력하세요')).toBeVisible();
    await expect(page.getByText('언어')).toBeVisible();
    await expect(page.getByText('카테고리')).toBeVisible();
    await expect(page.getByText('배틀 시간')).toBeVisible();
    await expect(page.getByText('배틀 공개 여부')).toBeVisible();
    await expect(page.getByText('대주제 선택')).toBeVisible();
    await expect(page.getByRole('button', { name: '취소' })).toBeVisible();
    await expect(page.getByTestId('create-battle-button')).toBeVisible();
  });
});

test.describe('배틀 생성 페이지 - 버튼 비활성화', () => {
  test('필수 항목 미입력 시 배틀 생성하기 버튼이 비활성화된다', async ({ page }) => {
    await injectOAuthUser(page);
    await page.goto('/battle/create');

    await expect(page.getByTestId('create-battle-button')).toBeDisabled();
  });

  test('제목만 입력 시 버튼이 비활성화된다', async ({ page }) => {
    await injectOAuthUser(page);
    await page.goto('/battle/create');

    await page.getByPlaceholder('예: 배열에서 중복 제거하기').fill('테스트 제목');

    await expect(page.getByTestId('create-battle-button')).toBeDisabled();
  });
});

test.describe('배틀 생성 페이지 - 버튼 활성화', () => {
  test('필수 항목 모두 입력 시 버튼이 활성화된다 (15분 / 쟁점 1개)', async ({ page }) => {
    await injectOAuthUser(page);
    await page.goto('/battle/create');

    await page.getByPlaceholder('예: 배열에서 중복 제거하기').fill('테스트 배틀');
    await page.getByPlaceholder('어떤 코드를 비교하고 싶으신가요?').fill('코드 비교 설명');
    await page.getByPlaceholder('첫 번째 코드를 입력하세요').fill('const a = 1;');
    await page.getByPlaceholder('두 번째 코드를 입력하세요').fill('let b = 2;');
    await page.getByLabel('효율성').check();

    await expect(page.getByTestId('create-battle-button')).toBeEnabled();
  });

  test('30분 선택 시 쟁점 2개 선택해야 버튼이 활성화된다', async ({ page }) => {
    await injectOAuthUser(page);
    await page.goto('/battle/create');

    await page.getByPlaceholder('예: 배열에서 중복 제거하기').fill('테스트 배틀');
    await page.getByPlaceholder('어떤 코드를 비교하고 싶으신가요?').fill('코드 비교 설명');
    await page.getByPlaceholder('첫 번째 코드를 입력하세요').fill('const a = 1;');
    await page.getByPlaceholder('두 번째 코드를 입력하세요').fill('let b = 2;');

    await page.selectOption('select:nth-of-type(2)', 'THIRTY_MIN');

    // 쟁점 1개만 선택 -> 버튼 비활성화
    await page.getByLabel('효율성').check();
    await expect(page.getByTestId('create-battle-button')).toBeDisabled();

    // 쟁점 2개 선택 -> 버튼 활성화
    await page.getByLabel('가독성').check();
    await expect(page.getByTestId('create-battle-button')).toBeEnabled();
  });
});
