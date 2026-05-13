import { z } from 'zod';
import { postBackend } from '../clients/backend.js';

export const injectSkipSchema = {
  battleId: z.string().min(1),
  userId: z.string().min(1).describe('스킵을 토글할 유저 ID. 배틀 참가자여야 함'),
  skip: z
    .boolean()
    .optional()
    .describe('true=스킵 활성화(기본), false=스킵 해제'),
};

interface InjectSkipResponse {
  battleId: string;
  userId: string;
  skip: boolean;
  totalSkips: number;
}

export async function injectSkip(params: {
  battleId: string;
  userId: string;
  skip?: boolean;
}): Promise<string> {
  const result = await postBackend<{ userId: string; skip?: boolean }, InjectSkipResponse>(
    `/dev/battles/${params.battleId}/skip`,
    { userId: params.userId, skip: params.skip },
  );

  return [
    `[injectSkip] 페이즈 스킵 토글 완료`,
    `battleId   : ${result.battleId}`,
    `userId     : ${result.userId}`,
    `skip       : ${result.skip}`,
    `totalSkips : ${result.totalSkips}`,
    `반영       : in-memory state · Redis · 소켓 USER_SKIPPED emit. 전원 스킵 시 자동 advance`,
  ].join('\n');
}
