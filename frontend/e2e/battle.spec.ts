import { test, expect, type Page } from '@playwright/test';
import { injectOAuthUser } from './helpers/auth';
import { BATTLE_ID, MOCK_BATTLE_INFO, MOCK_REFERENCE_DATA } from './helpers/mockData';

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

test.describe('배틀 페이지 - 코드 뷰어', () => {
  test('기본값은 스플릿 뷰로 A, B 코드가 동시에 표시된다', async ({ page }) => {
    await setupBattlePage(page);

    await expect(page.getByText('구현 A')).toBeVisible();
    await expect(page.getByText('구현 B')).toBeVisible();
    await expect(page.getByRole('button', { name: '스플릿 뷰' })).toBeVisible();
  });

  test('탭 뷰로 전환 후 B팀 클릭 시 구현 A가 사라지고 구현 B만 표시된다', async ({ page }) => {
    await setupBattlePage(page);

    await page.getByRole('button', { name: '탭 뷰' }).click();
    await page.getByRole('button', { name: 'B팀' }).click();

    await expect(page.getByText('구현 B')).toBeVisible();
    await expect(page.getByText('구현 A')).not.toBeVisible();
  });

  test('스플릿 뷰로 다시 전환하면 A팀/B팀 탭 버튼이 사라진다', async ({ page }) => {
    await setupBattlePage(page);

    await page.getByRole('button', { name: '탭 뷰' }).click();
    await expect(page.getByRole('button', { name: 'A팀' })).toBeVisible();

    await page.getByRole('button', { name: '스플릿 뷰' }).click();

    await expect(page.getByRole('button', { name: 'A팀' })).not.toBeVisible();
    await expect(page.getByText('구현 A')).toBeVisible();
    await expect(page.getByText('구현 B')).toBeVisible();
  });
});

test.describe('배틀 페이지 - 사이드바', () => {
  test('문제 설명 탭에 배틀 정보가 표시된다', async ({ page }) => {
    await setupBattlePage(page);

    await page.getByRole('button', { name: '문제 설명 보기' }).click();

    await expect(page.getByText('블록 if vs 한 줄 if')).toBeVisible();
    await expect(page.getByText('코드 스타일 비교: 블록 형태의 if문과 한 줄 if문 중 어떤 것이 더 가독성이 좋을까요?')).toBeVisible();
    await expect(page.getByText('REFACTORING')).toBeVisible();
  });

  test('타임라인 탭으로 전환하면 사이드바에 이의제기/반론 타임라인이 표시된다.', async ({ page }) => {
    await setupBattlePage(page);

    await page.getByRole('button', { name: '문제 설명 보기' }).click();
    await expect(page.getByText('블록 if vs 한 줄 if')).toBeVisible();

    await page.getByRole('button', { name: '타임라인' }).click();

    await expect(page.getByText('블록 if vs 한 줄 if')).not.toBeVisible();
  });

  test('참고 자료 탭으로 전환하면 AI 참고 자료가 표시된다', async ({ page }) => {
    await injectOAuthUser(page);

    await page.route(`**/api/battles/${BATTLE_ID}/join`, (route) =>
      route.fulfill({ status: 200, json: { ...MOCK_BATTLE_INFO, referenceData: MOCK_REFERENCE_DATA } })
    );
    await page.goto(BATTLE_URL);

    await page.getByRole('button', { name: '참고 자료 보기' }).click();

    await expect(page.getByText('AI 참고 자료')).toBeVisible();
    await expect(page.getByText('핵심 개념')).toBeVisible();
  });

  test('참고 자료 탭이 referenceData 없을 때 표시되지 않는다', async ({ page }) => {
    await setupBattlePage(page);

    await page.getByRole('button', { name: '문제 설명 보기' }).click();

    await expect(page.getByRole('button', { name: '참고 자료' })).not.toBeVisible();
  });

  test('사이드바 닫기 버튼 클릭 시 사이드바가 닫힌다', async ({ page }) => {
    await setupBattlePage(page);

    await page.getByRole('button', { name: '문제 설명 보기' }).click();
    await expect(page.getByText('블록 if vs 한 줄 if')).toBeVisible();

    await page.getByRole('button', { name: /닫기/ }).click();

    await expect(page.getByText('블록 if vs 한 줄 if')).not.toBeVisible();
  });
});
