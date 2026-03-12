import type { Page } from '@playwright/test';

/** Socket.IO (Engine.IO v4) 프로토콜 mock 헬퍼 */
export async function mockSocketIO(
  page: Page,
  eventHandlers: Record<string, unknown> = {}
): Promise<void> {
  await page.routeWebSocket(/localhost:3000/, (ws) => {
    // 1. Engine.IO OPEN 패킷
    ws.send(
      '0{"sid":"mock-sid","upgrades":[],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}'
    );
    // 2. Socket.IO namespace 연결 패킷
    ws.send('40');

    ws.onMessage((raw) => {
      const msg = typeof raw === 'string' ? raw : raw.toString();

      if (msg === '3') {
        // Engine.IO pong
        ws.send('2');
        return;
      }

      if (msg === '40') {
        // 클라이언트가 namespace 연결 확인 → 등록된 초기 이벤트 전송
        for (const [event, data] of Object.entries(eventHandlers)) {
          ws.send(`42[${JSON.stringify(event)},${JSON.stringify(data)}]`);
        }
        return;
      }
    });
  });
}

/** battle:joined 이벤트 mock 데이터 기본값 */
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
  chats: [],
  allChats: [],
  attacks: [],
  defenses: [],
};
