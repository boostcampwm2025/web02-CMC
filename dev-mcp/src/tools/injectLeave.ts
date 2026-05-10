import { z } from 'zod';
import { postBackend } from '../clients/backend.js';

export const injectLeaveSchema = {
  battleId: z.string().min(1),
  userId: z.string().min(1).describe('나가게 할 유저 ID. 배틀 참가자여야 함'),
};

interface InjectLeaveResponse {
  battleId: string;
  userId: string;
  counts: { teamA: number; teamB: number; teamNone: number };
  totalSkips: number;
}

export async function injectLeave(params: { battleId: string; userId: string }): Promise<string> {
  const result = await postBackend<{ userId: string }, InjectLeaveResponse>(
    `/dev/battles/${params.battleId}/leave`,
    { userId: params.userId },
  );

  return [
    `[injectLeave] 배틀 나가기 완료`,
    `battleId   : ${result.battleId}`,
    `userId     : ${result.userId}`,
    `counts     : A=${result.counts.teamA}, B=${result.counts.teamB}, NONE=${result.counts.teamNone}`,
    `totalSkips : ${result.totalSkips}`,
    `반영       : in-memory state · Redis · DB · 소켓 LEAVED emit. 잔여 참가자 모두 skip 시 자동 advance`,
  ].join('\n');
}
