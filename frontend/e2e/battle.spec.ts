import { test, expect, type Page } from '@playwright/test';
import { injectOAuthUser } from './helpers/auth';
import { mockSocketIO, setBattleTeam, setSocketPhase } from './helpers/socket';
import { BATTLE_ID, MOCK_BATTLE_INFO, MOCK_BATTLE_RESULT, MOCK_REFERENCE_DATA, DEFAULT_BATTLE_JOIN_DATA } from './helpers/mockData';

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
  // 초기 소켓 연결 및 battle:joined 처리 완료까지 대기
  await page.waitForFunction(
    () => (window as any).__battleStore__?.getState().chatInitialized === true
  );
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

  test('battle:leaved 이벤트 수신 시 팀 카운터 인원 수가 갱신된다', async ({ page }) => {
    const { emitToClient } = await setupBattlePageWithSocket(page);

    const teamStatus = page.locator('[data-tutorial="team-status"]');
    await expect(teamStatus.getByText('5')).toBeVisible();
    await expect(teamStatus.getByText('3')).toBeVisible();

    emitToClient('battle:leaved', {
      counts: { teamA: 4, teamB: 3, teamNone: 2 },
    });

    await expect(teamStatus.getByText('4')).toBeVisible();
    await expect(teamStatus.getByText('5')).not.toBeVisible();
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

test.describe('배틀 페이지 - 이의제기 입력 기능', () => {
  test('이의제기 페이즈에서 팀 미선택 시 입력 폼이 표시되지 않는다', async ({ page }) => {
    await setupBattlePageWithSocket(page, { ...DEFAULT_BATTLE_JOIN_DATA, phase: 'ATTACK' });

    await expect(page.getByPlaceholder('상대 코드의 허점을 찾아 이의 제기하세요')).not.toBeVisible();
  });

  test('이의제기 페이즈에서 팀 선택 후 이의제기 입력 폼이 표시되고 초기 버튼이 비활성화된다', async ({ page }) => {
    await setupBattlePageWithSocket(page, { ...DEFAULT_BATTLE_JOIN_DATA, phase: 'ATTACK' });
    await setBattleTeam(page, 'A');

    await expect(page.getByPlaceholder('상대 코드의 허점을 찾아 이의 제기하세요')).toBeVisible();
    await expect(page.getByRole('button', { name: '이의제기' })).toBeDisabled();
  });

  test('120자 초과 입력 시 120자로 잘리고 경고 토스트가 표시된다', async ({ page }) => {
    await setupBattlePageWithSocket(page, { ...DEFAULT_BATTLE_JOIN_DATA, phase: 'ATTACK' });
    await setBattleTeam(page, 'A');

    const input = page.getByPlaceholder('상대 코드의 허점을 찾아 이의 제기하세요');
    await input.fill('가'.repeat(130));

    await expect(input).toHaveValue('가'.repeat(120));
    await expect(page.getByText('이의제기은 최대 120글자까지 입력할 수 있습니다.')).toBeVisible();
  });

  test('이의제기 제출 후 소켓 이벤트로 vote list에 항목이 추가된다', async ({ page }) => {
    const { emitToClient } = await setupBattlePageWithSocket(page, { ...DEFAULT_BATTLE_JOIN_DATA, phase: 'ATTACK' });
    await setBattleTeam(page, 'A');

    emitToClient('battle:attack:created', {
      discussionId: 'attack-001',
      author: { id: 'mock-user-id', nickname: 'You' },
      content: 'test-test',
      upvotes: 0,
      votes: [],
    });

    await expect(page.getByText('test-test')).toBeVisible();
  });
});

test.describe('배틀 페이지 - 반론 입력 기능', () => {
  test('반론 페이즈에서 팀 미선택 시 입력 폼이 표시되지 않는다', async ({ page }) => {
    await setupBattlePageWithSocket(page, { ...DEFAULT_BATTLE_JOIN_DATA, phase: 'DEFENSE' });

    await expect(page.getByPlaceholder('상대 주장에 논리적으로 반박해 보세요')).not.toBeVisible();
  });

  test('반론 페이즈에서 팀 선택 후 반론 입력 폼이 표시되고 초기 버튼이 비활성화된다', async ({ page }) => {
    await setupBattlePageWithSocket(page, { ...DEFAULT_BATTLE_JOIN_DATA, phase: 'DEFENSE' });
    await setBattleTeam(page, 'B');

    await expect(page.getByPlaceholder('상대 주장에 논리적으로 반박해 보세요')).toBeVisible();
    await expect(page.getByRole('button', { name: '반론' })).toBeDisabled();
  });

  test('120자 초과 입력 시 120자로 잘리고 경고 토스트가 표시된다', async ({ page }) => {
    await setupBattlePageWithSocket(page, { ...DEFAULT_BATTLE_JOIN_DATA, phase: 'DEFENSE' });
    await setBattleTeam(page, 'B');

    const input = page.getByPlaceholder('상대 주장에 논리적으로 반박해 보세요');
    await input.fill('가'.repeat(130));

    await expect(input).toHaveValue('가'.repeat(120));
    await expect(page.getByText('반론은 최대 120글자까지 입력할 수 있습니다.')).toBeVisible();
  });

  test('반론 제출 후 소켓 이벤트로 vote list에 항목이 추가된다', async ({ page }) => {
    const { emitToClient } = await setupBattlePageWithSocket(page, { ...DEFAULT_BATTLE_JOIN_DATA, phase: 'DEFENSE' });
    await setBattleTeam(page, 'B');

    emitToClient('battle:defense:created', {
      discussionId: 'defense-001',
      author: { id: 'mock-user-id', nickname: 'You' },
      content: 'test-test',
      upvotes: 0,
      votes: [],
    });

    await expect(page.getByText('test-test')).toBeVisible();
  });
});

test.describe('배틀 페이지 - 적팀 선정 공지 모달', () => {
  test('적팀 이의제기가 선정되면 모달이 표시되고 페이즈 전환 시 채팅 공지가 표시된다', async ({ page }) => {
    const { emitToClient } = await setupBattlePageWithSocket(page, { ...DEFAULT_BATTLE_JOIN_DATA, phase: 'ATTACK' });
    await setBattleTeam(page, 'A');

    emitToClient('battle:attacked', {
      battleId: BATTLE_ID,
      attack: {
        aTeam: { id: null, text: null, ownerId: null, nickname: null, count: null, team: null },
        bTeam: { id: 'attack-selected-001', text: 'Temp-Attack', ownerId: 'user-b', nickname: 'B팀원', count: 5, team: 'B' },
      },
    });

    // 이의제기 선정 즉시 모달 표시
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('이의제기!!')).toBeVisible();
    await expect(page.getByText('Temp-Attack')).toBeVisible();

    setSocketPhase(emitToClient, 'DEFENSE');
    await expect(page.getByText('B팀의 공격')).toBeVisible();
  });

  test('적팀 반론이 선정되면 모달이 표시되고 페이즈 전환 시 채팅 공지가 표시된다', async ({ page }) => {
    const { emitToClient } = await setupBattlePageWithSocket(page, { ...DEFAULT_BATTLE_JOIN_DATA, phase: 'DEFENSE' });
    await setBattleTeam(page, 'B');

    emitToClient('battle:defensed', {
      battleId: BATTLE_ID,
      defense: {
        aTeam: { id: 'defense-selected-001', text: 'Temp-Defense', ownerId: 'user-a', nickname: 'A팀원', count: 3, team: 'A' },
        bTeam: { id: null, text: null, ownerId: null, nickname: null, count: null, team: null },
      },
    });

    // 반론 선정 즉시 모달 표시
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('반론!!')).toBeVisible();
    await expect(page.getByText('Temp-Defense')).toBeVisible();

    setSocketPhase(emitToClient, 'OPINION_SHARE');
    await expect(page.getByText('A팀의 반론')).toBeVisible();
  });
});

test.describe('배틀 페이지 - 팀 변경 투표', () => {
  test('TEAM_SWITCH 페이즈 진입 후 B팀 선택 시 팀이 B로 변경되고 B팀 채팅이 표시된다', async ({ page }) => {
    const { emitToClient } = await setupBattlePageWithSocket(page);
    await setBattleTeam(page, 'A');

    await expect(page.getByText('A팀 채팅입니다')).toBeVisible();

    setSocketPhase(emitToClient, 'TEAM_SWITCH');

    const modal = page.locator('#modal-root');
    await expect(modal.getByText('💡투표 후에도 다음 투표 시간에 팀을 변경할 수 있어요')).toBeVisible({ timeout: 6000 });

    await modal.getByRole('button', { name: /B팀/ }).click();

    await expect(modal.getByText('💡투표 후에도 다음 투표 시간에 팀을 변경할 수 있어요')).not.toBeVisible();

    await expect(page.getByText('B팀 채팅입니다')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('A팀 채팅입니다')).not.toBeVisible();
  });

  test('battle:all:updated 수신 시 팀 변경 이동 추이 모달이 표시된다', async ({ page }) => {
    const { emitToClient } = await setupBattlePageWithSocket(page);
    await setBattleTeam(page, 'A');

    emitToClient('battle:all:updated', {
      battleId: BATTLE_ID,
      round: 1,
      before: { teamA: 5, teamB: 3, teamNone: 2 },
      after: { teamA: 8, teamB: 2, teamNone: 0 },
      changes: [],
      difference: { teamA: 3, teamB: -1, teamNone: -2 },
      dominantTeam: 'A',
    });

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('ROUND 1 결과')).toBeVisible();
    await expect(page.getByText('TEAM A')).toBeVisible();
    await expect(page.getByText('TEAM B')).toBeVisible();
    await expect(page.getByText('A팀이 우세하고 있습니다!')).toBeVisible();
  });
});

test.describe('배틀 페이지 - 페이즈 스킵', () => {
  test('모든 참여자가 스킵에 동의하면 스킵 모달이 표시되고 다음 페이즈로 전환된다', async ({ page }) => {
    // 기본 참여 인원: teamA(5) + teamB(3) + teamNone(2) = 10명
    const totalParticipants = 10;
    const { emitToClient } = await setupBattlePageWithSocket(page);
    await setBattleTeam(page, 'A');

    await expect(page.getByText('의견 공유')).toBeVisible();
    await expect(page.getByText(`현재 0명이 스킵을 희망합니다.`)).toBeVisible();

    const skipToggle = page.getByText('이번 페이즈 스킵').locator('..').getByRole('button');
    await skipToggle.click();

    emitToClient('battle:user:skipped', { totalSkips: totalParticipants });
    await expect(page.getByText(`현재 ${totalParticipants}명이 스킵을 희망합니다.`)).toBeVisible();

    emitToClient('battle:phase:skipped', {});

    await expect(page.getByText('다음 페이즈로 이동합니다...')).toBeVisible({ timeout: 5000 });

    setSocketPhase(emitToClient, 'ATTACK');

    await expect(page.getByText('다음 페이즈로 이동합니다...')).not.toBeVisible({ timeout: 5000 });

    await page.waitForFunction(
      () => (window as any).__battleStore__?.getState().battleProgress?.phase === 'ATTACK'
    );

    // 스테이지 상태표시바에 이의제기 페이즈 메시지가 표시됨 
    await expect(page.getByText('양 진영이 서로의 코드에 대해 공격합니다.')).toBeVisible();
  });
});

test.describe('배틀 페이지 - 배틀 종료', () => {
  test('battle:closed 수신 시 결과 페이지로 이동하고 결과가 표시된다', async ({ page }) => {
    await page.route(`**/api/battles/${BATTLE_ID}/result`, (route) =>
      route.fulfill({ status: 200, json: MOCK_BATTLE_RESULT })
    );

    const { emitToClient } = await setupBattlePageWithSocket(page);
    await setBattleTeam(page, 'A');

    // 배틀 종료 이벤트 수신
    emitToClient('battle:closed', { battleId: BATTLE_ID });

    await expect(page).toHaveURL(`/battles/${BATTLE_ID}/result`);

    // 승자 섹션: A팀 승리 표시 (데이터 로드 완료 기준점)
    await expect(page.getByText('🎉 승리 팀: 코드 A')).toBeVisible();
    await expect(page.getByText('코드 A (8표)')).toBeVisible();
    await expect(page.getByText('코드 B (5표)')).toBeVisible();

    await expect(page.getByRole('heading', { name: 'MVP' })).toBeVisible();
    await expect(page.getByText('최고의 전략가')).toBeVisible();
    await expect(page.getByText('최고전략가')).toBeVisible();
  });
});
