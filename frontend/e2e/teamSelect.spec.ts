import { test, expect, type Page } from '@playwright/test';
import { injectOAuthUser } from './helpers/auth';

const BATTLE_ID = 'test-battle-001';
const BATTLE_URL = `/battle/${BATTLE_ID}/team-select`;

const MOCK_BATTLE_INFO = {
  id: BATTLE_ID,
  title: '블록 if vs 한 줄 if',
  description: '코드 스타일 비교: 블록 형태의 if문과 한 줄 if문 중 어떤 것이 더 가독성이 좋을까요?',
  aCode: 'if (condition) {\n  doSomething();\n}',
  bCode: 'if (condition) doSomething();',
  language: 'JavaScript',
  category: 'REFACTORING',
  participantCount: 42,
  currentRound: 1,
  totalRounds: 3,
  topics: ['가독성', '유지보수성', '코드 스타일'],
  currentPhase: 'OPINION_SHARE' as const,
  phaseCount: 1,
  timelines: { attacks: [], defenses: [] },
  inviteCode: 'TEST-INVITE',
};

async function setupPage(page: Page) {
  await injectOAuthUser(page);
  await page.route(`**/api/battles/${BATTLE_ID}/join`, (route) =>
    route.fulfill({ status: 200, json: MOCK_BATTLE_INFO })
  );
  await page.goto(BATTLE_URL);
}


test.describe('팀 선택 페이지 - 돌아가기', () => {
  test('돌아가기 버튼 클릭 시 메인 페이지로 이동한다', async ({ page }) => {
    await setupPage(page);

    await page.getByRole('button', { name: '← 돌아가기' }).click();

    await expect(page).toHaveURL('/main');
  });
});
