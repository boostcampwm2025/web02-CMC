import type { Page } from '@playwright/test';
import { DEFAULT_BATTLE_JOIN_DATA } from './mockData';

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
  await page.evaluate(() => {
    const store = (window as unknown as { __battleStore__?: { getState: () => { setChatInitialized: (v: boolean) => void } } }).__battleStore__;
    store?.getState().setChatInitialized(false);
  });
  await page.evaluate((t) => {
    const store = (window as unknown as { __battleStore__?: { getState: () => { setSelectedTeam: (team: string) => void } } }).__battleStore__;
    store?.getState().setSelectedTeam(t);
  }, team);
  await page.waitForFunction(
    () => (window as any).__battleStore__?.getState().chatInitialized === true
  );
}

export function setSocketPhase(
  emitToClient: (event: string, data: unknown) => void,
  phase: string
): void {
  emitToClient('battle:phase:updated', {
    phase,
    phaseCount: 1,
    startedAt: Date.now() - 60000,
    expiredAt: Date.now() + 180000,
  });
}

