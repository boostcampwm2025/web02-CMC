import { test, expect, type Page } from '@playwright/test';
import { injectOAuthUser } from './helpers/auth';

async function fillRequiredFields(page: Page) {
  await page.getByPlaceholder('예: 배열에서 중복 제거하기').fill('테스트 배틀');
  await page.getByPlaceholder('어떤 코드를 비교하고 싶으신가요?').fill('코드 비교 설명');
  await page.getByPlaceholder('첫 번째 코드를 입력하세요').fill('const a = 1;');
  await page.getByPlaceholder('두 번째 코드를 입력하세요').fill('let b = 2;');
  await page.getByLabel('효율성').check();
}

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

    await fillRequiredFields(page);

    await expect(page.getByTestId('create-battle-button')).toBeEnabled();
  });

  test('30분 선택 시 쟁점 2개 선택해야 버튼이 활성화된다', async ({ page }) => {
    await injectOAuthUser(page);
    await page.goto('/battle/create');

    await page.getByPlaceholder('예: 배열에서 중복 제거하기').fill('테스트 배틀');
    await page.getByPlaceholder('어떤 코드를 비교하고 싶으신가요?').fill('코드 비교 설명');
    await page.getByPlaceholder('첫 번째 코드를 입력하세요').fill('const a = 1;');
    await page.getByPlaceholder('두 번째 코드를 입력하세요').fill('let b = 2;');
    await page.locator('select').nth(2).selectOption({ label: '30분' });

    await page.getByLabel('효율성').check();
    await expect(page.getByTestId('create-battle-button')).toBeDisabled();

    await page.getByLabel('가독성').check();
    await expect(page.getByTestId('create-battle-button')).toBeEnabled();
  });
});

test.describe('배틀 생성 페이지 - 생성 플로우', () => {
  test('생성 중 로딩 오버레이가 노출된다', async ({ page }) => {
    await injectOAuthUser(page);
    await page.route('**/api/battles', (route) => {
      setTimeout(() => route.fulfill({ status: 200, json: { battleId: 'new-battle-id' } }), 1000);
    });
    await page.goto('/battle/create');

    await fillRequiredFields(page);
    await page.getByTestId('create-battle-button').click();

    await expect(page.getByText('배틀 생성 중입니다...')).toBeVisible();
  });

  test('배틀 생성 성공 시 팀 선택 페이지로 이동한다', async ({ page }) => {
    await injectOAuthUser(page);
    await page.route('**/api/battles', (route) =>
      route.fulfill({ status: 200, json: { battleId: 'new-battle-id' } })
    );
    await page.goto('/battle/create');

    await fillRequiredFields(page);
    await page.getByTestId('create-battle-button').click();

    await expect(page).toHaveURL('/battle/new-battle-id/team-select/');
  });

  test('배틀 생성 API 실패 시 toast가 노출된다', async ({ page }) => {
    await injectOAuthUser(page);
    await page.route('**/api/battles', (route) =>
      route.fulfill({ status: 500 })
    );
    await page.goto('/battle/create');

    await fillRequiredFields(page);
    await page.getByTestId('create-battle-button').click();

    await expect(page.getByText('배틀 생성에 실패했습니다.')).toBeVisible();
  });
});
