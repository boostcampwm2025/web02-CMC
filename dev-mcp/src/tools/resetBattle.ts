import { z } from 'zod';
import { deleteBackend } from '../clients/backend.js';

export const resetBattleSchema = {
  battleId: z.string().min(1),
};

interface ResetBattleResponse {
  battleId: string;
  deleted: { timer: boolean; redis: boolean; memory: boolean; db: boolean };
}

export async function resetBattle(params: { battleId: string }): Promise<string> {
  const result = await deleteBackend<ResetBattleResponse>(`/dev/battles/${params.battleId}`);

  const mark = (ok: boolean) => (ok ? 'OK' : 'FAIL');
  const { timer, redis, memory, db } = result.deleted;

  return [
    `[resetBattle] 배틀 정리 완료`,
    `battleId : ${result.battleId}`,
    `timer    : ${mark(timer)} (ZSET entry)`,
    `redis    : ${mark(redis)} (battle:* keys)`,
    `memory   : ${mark(memory)} (liveStates)`,
    `db       : ${mark(db)} (battle row + cascade)`,
  ].join('\n');
}
