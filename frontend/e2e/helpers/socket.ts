import type { Page } from '@playwright/test';
import { DEFAULT_BATTLE_JOIN_DATA, TEAM_A_CHATS, TEAM_B_CHATS } from './mockData';

const EIO_CONNECT = `40`; 
const EIO_EVENT = `42`;  

type BattleSocketHandle = {
  emitToClient: (event: string, data: unknown) => void;
  onClientEvent: <T = unknown>(event: string, handler: (data: T) => void) => void;
  setBattleTeam: (team: 'A' | 'B' | 'NONE') => Promise<void>;
};

export async function mockSocketIO(
  page: Page,
  battleJoinData: typeof DEFAULT_BATTLE_JOIN_DATA = DEFAULT_BATTLE_JOIN_DATA
): Promise<BattleSocketHandle> {
  let sendToClient: ((msg: string) => void) | null = null;
  const clientEventHandlers = new Map<string, (data: unknown) => void>();

  await page.routeWebSocket(/localhost:3000/, (ws) => {
    sendToClient = (msg: string) => ws.send(msg);

    ws.send(
      '0{"sid":"mock-sid","upgrades":[],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}'
    );

    ws.onMessage((raw) => {
      const msg = typeof raw === 'string' ? raw : raw.toString();

      if (msg.startsWith(EIO_CONNECT)) {
        ws.send(`${EIO_CONNECT}{"sid":"mock-socket-id"}`);
        return;
      }

      if (msg.startsWith(EIO_EVENT)) {
        const [event, data] = JSON.parse(msg.slice(EIO_EVENT.length)) as [string, unknown];

        if (event === 'battle:join') {
          const joinTeam = (data as { team?: string })?.team ?? 'NONE';
          const teamChats = joinTeam === 'A' ? TEAM_A_CHATS : joinTeam === 'B' ? TEAM_B_CHATS : [];
          ws.send(`${EIO_EVENT}["battle:joined",${JSON.stringify({ ...battleJoinData, chats: teamChats })}]`);
          return;
        }

        clientEventHandlers.get(event)?.(data);
      }
    });
  });

  const emitToClient = (event: string, data: unknown) => {
    sendToClient?.(`${EIO_EVENT}[${JSON.stringify(event)},${JSON.stringify(data)}]`);
  };

  return {
    emitToClient,
    onClientEvent: (event, handler) => {
      clientEventHandlers.set(event, handler as (data: unknown) => void);
    },
    setBattleTeam: (team) => setBattleTeam(page, team),
  };
}

async function setBattleTeam(page: Page, team: 'A' | 'B' | 'NONE'): Promise<void> {
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
