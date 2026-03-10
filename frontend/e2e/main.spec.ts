import { test, expect } from '@playwright/test';
import { injectOAuthUser, mockUnauthenticated } from './helpers/auth';

const MOCK_OPEN_BATTLE = {
  id: 'battle-live-001',
  title: '블록 if vs 한 줄 if',
  description: '코드 스타일 비교',
  status: 'OPEN',
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 3600000).toISOString(),
  clientCount: 10,
  category: 'REFACTORING',
  timeLabel: '1시간 후 종료',
};

const MOCK_CLOSED_BATTLE = {
  id: 'battle-closed-001',
  title: '재귀 vs 반복문',
  description: '알고리즘 접근법 비교',
  category: 'ALGORITHM',
  status: 'CLOSED',
  createdAt: new Date().toISOString(),
  expiresAt: new Date().toISOString(),
  result: {
    winner: 'A',
    teamA: { votes: 30, percentage: 60 },
    teamB: { votes: 20, percentage: 40 },
    neutral: { votes: 0, percentage: 0 },
  },
};

test.describe('메인 페이지 - 렌더링', () => {
  test('기본 Hero 섹션이 렌더링된다', async ({ page }) => {
    await mockUnauthenticated(page);
    await page.goto('/main');

    await expect(page.getByRole('heading', { name: '코문철' })).toBeVisible();
    await expect(page.getByRole('button', { name: '새 배틀 생성' })).toBeVisible();
    await expect(page.getByRole('link', { name: '튜토리얼' })).toBeVisible();
  });

  test('실시간 배틀 / 지난 배틀 결과 섹션 헤더가 렌더링된다', async ({ page }) => {
    await mockUnauthenticated(page);
    await page.goto('/main');

    await expect(page.getByRole('heading', { name: '실시간 배틀' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '지난 배틀 결과' })).toBeVisible();
  });

  test('비로그인 상태에서 헤더에 로그인 링크가 표시된다', async ({ page }) => {
    await mockUnauthenticated(page);
    await page.goto('/main');

    await expect(page.getByRole('link', { name: '로그인' })).toBeVisible();
  });

  test('로그인 상태에서 헤더에 유저 닉네임과 티어 아이콘이 표시된다', async ({ page }) => {
    await injectOAuthUser(page);
    await page.goto('/main');

    await expect(page.getByText('테스트유저')).toBeVisible();
    await expect(page.getByAltText('BRONZE tier')).toBeVisible();
    await expect(page.getByRole('link', { name: '로그인' })).not.toBeVisible();
  });

  test('실시간 배틀 카드가 렌더링된다', async ({ page }) => {
    await mockUnauthenticated(page);
    await page.route('**/api/battles/open*', (route) =>
      route.fulfill({ status: 200, json: { battles: [MOCK_OPEN_BATTLE], meta: { offset: 0, limit: 3, total: 1 } } })
    );
    await page.goto('/main');

    await expect(page.getByText('블록 if vs 한 줄 if')).toBeVisible();
    await expect(page.getByRole('link', { name: 'LIVE NOW →' })).toBeVisible();
  });

  test('지난 배틀 결과 카드가 렌더링된다', async ({ page }) => {
    await mockUnauthenticated(page);
    await page.route('**/api/battles/closed*', (route) =>
      route.fulfill({ status: 200, json: { battles: [MOCK_CLOSED_BATTLE], meta: { offset: 0, limit: 6, total: 1 } } })
    );
    await page.goto('/main');

    await expect(page.getByText('재귀 vs 반복문')).toBeVisible();
    await expect(page.getByRole('link', { name: '결과 보기 →' })).toBeVisible();
  });

  test('배틀 목록 API 실패 시 에러 바운더리가 노출된다', async ({ page }) => {
    await mockUnauthenticated(page);
    await page.route('**/api/battles/open*', (route) => route.fulfill({ status: 500 }));
    await page.route('**/api/battles/closed*', (route) => route.fulfill({ status: 500 }));
    await page.goto('/main');

    await expect(page.getByText('실시간 배틀을 불러올 수 없습니다')).toBeVisible();
    await expect(page.getByText('지난 배틀 결과를 불러올 수 없습니다')).toBeVisible();
  });

  test('배틀이 없을 때 empty state가 노출된다', async ({ page }) => {
    await mockUnauthenticated(page);
    await page.route('**/api/battles/open*', (route) =>
      route.fulfill({ status: 200, json: { battles: [], meta: { offset: 0, limit: 3, total: 0 } } })
    );
    await page.route('**/api/battles/closed*', (route) =>
      route.fulfill({ status: 200, json: { battles: [], meta: { offset: 0, limit: 6, total: 0 } } })
    );
    await page.goto('/main');

    await expect(page.getByText('진행 중인 배틀이 없습니다')).toBeVisible();
    await expect(page.getByText('종료된 배틀이 없습니다')).toBeVisible();
  });
});

test.describe('메인 페이지 - 배틀 카드 클릭', () => {
  test('LIVE NOW → 클릭 시 팀 선택 페이지로 이동한다', async ({ page }) => {
    await mockUnauthenticated(page);
    await page.route('**/api/battles/open*', (route) =>
      route.fulfill({ status: 200, json: { battles: [MOCK_OPEN_BATTLE], meta: { offset: 0, limit: 3, total: 1 } } })
    );
    await page.goto('/main');

    await page.getByRole('link', { name: 'LIVE NOW →' }).click();

    await expect(page).toHaveURL(`/battle/${MOCK_OPEN_BATTLE.id}/team-select`);
  });

  test('결과 보기 → 클릭 시 결과 페이지로 이동한다', async ({ page }) => {
    await mockUnauthenticated(page);
    await page.route('**/api/battles/closed*', (route) =>
      route.fulfill({ status: 200, json: { battles: [MOCK_CLOSED_BATTLE], meta: { offset: 0, limit: 6, total: 1 } } })
    );
    await page.goto('/main');

    await page.getByRole('link', { name: '결과 보기 →' }).click();

    await expect(page).toHaveURL(`/battles/${MOCK_CLOSED_BATTLE.id}/result`);
  });
});

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
