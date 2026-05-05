import { z } from 'zod';
import { postBackend } from '../clients/backend.js';

export const setTimerSchema = {
  battleId: z.string().min(1),
  durationMs: z.number().int().min(0).describe('현재 시점부터 만료까지 ms.'),
};

interface SetTimerResponse {
  battleId: string;
  durationMs: number;
}

export async function setTimer({
  battleId,
  durationMs,
}: {
  battleId: string;
  durationMs: number;
}): Promise<string> {
  const result = await postBackend<{ durationMs: number }, SetTimerResponse>(
    `/dev/battles/${battleId}/timer`,
    { durationMs },
  );

  return [
    `[setTimer] 타이머 변경 완료`,
    `battleId : ${result.battleId}`,
    `만료까지 : ${result.durationMs}ms`,
    `반영     : 백엔드 in-memory state · Redis · DB · 소켓 emit · timer 스케줄`,
  ].join('\n');
}
