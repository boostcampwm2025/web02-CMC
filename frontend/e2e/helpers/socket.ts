import type { Page } from '@playwright/test';

export async function mockSocketIO(
  page: Page,
  battleJoinData: typeof DEFAULT_BATTLE_JOIN_DATA = DEFAULT_BATTLE_JOIN_DATA
): Promise<{ emitToClient: (event: string, data: unknown) => void }> {
  let sendToClient: ((msg: string) => void) | null = null;

  await page.routeWebSocket(/localhost:3000/, (ws) => {
    sendToClient = (msg: string) => ws.send(msg);

    ws.send(
      '0{"sid":"mock-sid","upgrades":[],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}'
    );

    ws.onMessage((raw) => {
      const msg = typeof raw === 'string' ? raw : raw.toString();
      if (msg.startsWith('40')) {
        ws.send('40{"sid":"mock-socket-id"}');
        return;
      }
      if (msg.startsWith('42') && msg.includes('"battle:join"')) {
        ws.send(`42["battle:joined",${JSON.stringify(battleJoinData)}]`);
        return;
      }
    });
  });

  return {
    emitToClient: (event: string, data: unknown) => {
      sendToClient?.(`42[${JSON.stringify(event)},${JSON.stringify(data)}]`);
    }
  };
}


export async function setBattleTeam(page: Page, team: 'A' | 'B' | 'NONE'): Promise<void> {
  await page.evaluate((t) => {
    const store = (window as unknown as { __battleStore__?: { getState: () => { setSelectedTeam: (team: string) => void } } }).__battleStore__;
    store?.getState().setSelectedTeam(t);
  }, team);
  await page.waitForFunction(
    () => (window as any).__battleStore__?.getState().isConnected === true
  );
}

export const DEFAULT_BATTLE_JOIN_DATA = {
  battleId: 'test-battle-001',
  round: 1,
  topics: ['가독성', '유지보수성', '코드 스타일'],
  phase: 'OPINION_SHARE' as const,
  phaseCount: 1,
  startedAt: Date.now() - 60000,
  expiredAt: Date.now() + 180000,
  counts: { teamA: 5, teamB: 3, teamNone: 2 },
  timelines: { attacks: [], defenses: [] },
  chats: [] as Array<{ messageId: string; battleId: string; sender: { userId: string; nickname: string; tier?: string }; team: string; scope: string; text: string; createdAt: string; type?: string }>,
  allChats: [
    {
      messageId: 'prev-msg-001',
      battleId: 'test-battle-001',
      sender: { userId: 'user-a', nickname: '이전유저', tier: 'GOLD' },
      team: 'NONE',
      scope: 'ALL',
      text: '이전 채팅 내용입니다',
      createdAt: new Date(Date.now() - 60000).toISOString(),
      type: 'chat',
    },
  ] as Array<{ messageId: string; battleId: string; sender: { userId: string; nickname: string; tier?: string }; team: string; scope: string; text: string; createdAt: string; type?: string }>,
  attacks: [],
  defenses: [],
};
