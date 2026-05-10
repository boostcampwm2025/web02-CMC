import { z } from 'zod';
import { postBackend } from '../clients/backend.js';

export const injectTeamVoteSchema = {
  battleId: z.string().min(1),
  userId: z.string().min(1).describe('진영 변경 투표할 유저 ID. 배틀 참가자여야 함'),
  team: z.enum(['A', 'B', 'NONE']).describe('이동 희망 진영. NONE=중립'),
};

interface InjectTeamVoteResponse {
  battleId: string;
  userId: string;
  team: string;
  counts: { A: number; B: number; NONE: number };
}

export async function injectTeamVote(params: {
  battleId: string;
  userId: string;
  team: 'A' | 'B' | 'NONE';
}): Promise<string> {
  const result = await postBackend<
    { userId: string; team: 'A' | 'B' | 'NONE' },
    InjectTeamVoteResponse
  >(`/dev/battles/${params.battleId}/team-vote`, {
    userId: params.userId,
    team: params.team,
  });

  return [
    `[injectTeamVote] 진영 투표 완료`,
    `battleId : ${result.battleId}`,
    `userId   : ${result.userId}`,
    `team     : ${result.team}`,
    `counts   : A=${result.counts.A}, B=${result.counts.B}, NONE=${result.counts.NONE}`,
    `반영     : in-memory state · Redis · DB (broadcast 없음. TEAM_SWITCH 페이즈 진입 시 일괄 emit)`,
  ].join('\n');
}
