import { test, expect, type Page } from '@playwright/test';
import { injectOAuthUser } from './helpers/auth';
import { mockSocketIO, setBattleTeam, DEFAULT_BATTLE_JOIN_DATA } from './helpers/socket';
import { BATTLE_ID, MOCK_BATTLE_INFO, MOCK_REFERENCE_DATA } from './helpers/mockData';

const BATTLE_URL = `/battle/${BATTLE_ID}`;

async function setupBattlePage(page: Page) {
  await injectOAuthUser(page);
  await page.route(`**/api/battles/${BATTLE_ID}/join`, (route) =>
    route.fulfill({ status: 200, json: MOCK_BATTLE_INFO })
  );
  await page.goto(BATTLE_URL);
}

async function setupBattlePageWithSocket(
  page: Page,
  battleJoinData = DEFAULT_BATTLE_JOIN_DATA
) {
  await injectOAuthUser(page);
  await page.route(`**/api/battles/${BATTLE_ID}/join`, (route) =>
    route.fulfill({ status: 200, json: MOCK_BATTLE_INFO })
  );
  const socket = await mockSocketIO(page, battleJoinData);
  await page.goto(BATTLE_URL);
  return socket;
}

test.describe('배틀 페이지 - 렌더링', () => {
  test('코드 뷰어에 API 데이터가 렌더링된다', async ({ page }) => {
    await setupBattlePage(page);

    await expect(page.getByText('JavaScript').first()).toBeVisible();
    await expect(page.getByText('구현 A')).toBeVisible();
    await expect(page.getByText('구현 B')).toBeVisible();
    await expect(page.getByText(/if \(condition\)/).first()).toBeVisible();
    await expect(page.getByRole('button', { name: '친구 초대' })).toBeVisible();
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

  test('스플릿 뷰 버튼 클릭시 스플릿 뷰로 전환되고 A팀/B팀 탭 버튼이 사라진다', async ({ page }) => {
    await setupBattlePage(page);

    await page.getByRole('button', { name: '탭 뷰' }).click();
    await expect(page.getByRole('button', { name: 'A팀' })).toBeVisible();

    await page.getByRole('button', { name: '스플릿 뷰' }).click();

    await expect(page.getByRole('button', { name: 'A팀' })).not.toBeVisible();
    await expect(page.getByText('구현 A')).toBeVisible();
    await expect(page.getByText('구현 B')).toBeVisible();
  });
});

test.describe('배틀 페이지 - 네비게이션', () => {
  test('돌아가기 버튼 클릭 시 메인 페이지로 이동한다', async ({ page }) => {
    await setupBattlePage(page);

    await page.getByRole('button', { name: '← 돌아가기' }).click();

    await expect(page).toHaveURL('/main');
  });
});

test.describe('배틀 페이지 - 헤더', () => {
  test('소켓 연결 후 팀 카운터에 인원 수가 표시된다', async ({ page }) => {
    await setupBattlePageWithSocket(page);

    const teamStatus = page.locator('[data-tutorial="team-status"]');
    await expect(teamStatus.getByText('5')).toBeVisible();
    await expect(teamStatus.getByText('3')).toBeVisible();
    await expect(teamStatus.getByText('A팀')).toBeVisible();
    await expect(teamStatus.getByText('B팀')).toBeVisible();
  });

  test('소켓 연결 후 스테이지 표시바에 라운드와 페이즈가 표시된다', async ({ page }) => {
    await setupBattlePageWithSocket(page);

    await expect(page.getByText('1 Round')).toBeVisible();
    await expect(page.getByText('의견 공유')).toBeVisible();
  });
});


test.describe('배틀 페이지 - 채팅', () => {
  test('소켓 연결 후 채팅 라운지가 표시되며 이전 채팅 내용이 채팅창에 표시된다', async ({ page }) => {
    await setupBattlePageWithSocket(page);

    await expect(page.getByRole('heading', { name: '라운지' })).toBeVisible();
    await expect(page.getByText('전체 라운지')).toBeVisible();
    await expect(page.getByText('이전 채팅 내용입니다')).toBeVisible();
  });

  test('소켓으로 채팅 메시지를 받으면 채팅창에 표시된다', async ({ page }) => {
    const { emitToClient } = await setupBattlePageWithSocket(page);

    await expect(page.locator('[data-tutorial="team-status"]').getByText('5')).toBeVisible();

    emitToClient('battle:chatted', {
      messageId: 'msg-001',
      battleId: BATTLE_ID,
      sender: { userId: 'other-user', nickname: '다른유저', tier: 'SILVER' },
      team: 'NONE',
      scope: 'ALL',
      text: '안녕하세요!',
      createdAt: new Date().toISOString(),
      type: 'chat',
    });

    await expect(page.getByText('안녕하세요!')).toBeVisible();
  });

  test('A팀 유저의 팀 채팅 메시지가 팀 라운지 탭에 표시된다', async ({ page }) => {
    const { emitToClient } = await setupBattlePageWithSocket(page);

    await expect(page.locator('[data-tutorial="team-status"]').getByText('5')).toBeVisible();
    await setBattleTeam(page, 'A');

    emitToClient('battle:chatted', {
      messageId: 'msg-team-a',
      battleId: BATTLE_ID,
      sender: { userId: 'teammate', nickname: 'A팀원', tier: 'GOLD' },
      team: 'A',
      scope: 'TEAM',
      text: 'A팀 전용 메시지입니다',
      createdAt: new Date().toISOString(),
      type: 'chat',
    });

    await expect(page.getByText('A팀 전용 메시지입니다')).toBeVisible();
  });

  test('B팀 유저의 팀 채팅 메시지가 팀 라운지 탭에 표시된다', async ({ page }) => {
    const { emitToClient } = await setupBattlePageWithSocket(page);

    await expect(page.locator('[data-tutorial="team-status"]').getByText('5')).toBeVisible();
    await setBattleTeam(page, 'B');

    emitToClient('battle:chatted', {
      messageId: 'msg-team-b',
      battleId: BATTLE_ID,
      sender: { userId: 'teammate', nickname: 'B팀원', tier: 'SILVER' },
      team: 'B',
      scope: 'TEAM',
      text: 'B팀 전용 메시지입니다',
      createdAt: new Date().toISOString(),
      type: 'chat',
    });

    await expect(page.getByText('B팀 전용 메시지입니다')).toBeVisible();
  });

  test('전체 채팅 메시지는 전체 라운지 탭에서만 표시된다', async ({ page }) => {
    const { emitToClient } = await setupBattlePageWithSocket(page);

    await expect(page.locator('[data-tutorial="team-status"]').getByText('5')).toBeVisible();
    await setBattleTeam(page, 'A');

    emitToClient('battle:chatted', {
      messageId: 'msg-all-001',
      battleId: BATTLE_ID,
      sender: { userId: 'other-user', nickname: '다른유저', tier: 'BRONZE' },
      team: 'B',
      scope: 'ALL',
      text: '전체 공개 메시지입니다',
      createdAt: new Date().toISOString(),
      type: 'chat',
    });

    // 팀 라운지 탭에는 표시 안 됨
    await expect(page.getByText('전체 공개 메시지입니다')).not.toBeVisible();

    // 전체 라운지 탭으로 전환하면 표시됨
    await page.getByRole('button', { name: '전체 라운지' }).click();
    await expect(page.getByText('전체 공개 메시지입니다')).toBeVisible();
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

    await expect(page.locator('[data-tutorial="sidebar-panel"]')).toHaveClass(/-translate-x-full/);
  });
});
