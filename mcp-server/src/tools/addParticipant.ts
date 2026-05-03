import { z } from 'zod';
import { postBackend } from '../clients/backend.js';

export const addParticipantSchema = {
  battleId: z.string().min(1),
  team: z.enum(['A', 'B']),
  userId: z.string().optional().describe('생략 시 새 UUID 자동 생성 (FK 없음, dev 가짜)'),
  nickname: z.string().optional().describe('생략 시 "테스터-{팀}{인덱스}" 자동 부여'),
};

interface AddParticipantResponse {
  battleId: string;
  userId: string;
  team: string;
  nickname: string;
  counts: { teamA: number; teamB: number; teamNone: number };
}

export async function addParticipant(params: {
  battleId: string;
  team: 'A' | 'B';
  userId?: string;
  nickname?: string;
}): Promise<string> {
  const result = await postBackend<
    { team: 'A' | 'B'; userId?: string; nickname?: string },
    AddParticipantResponse
  >(`/dev/battles/${params.battleId}/participant`, {
    team: params.team,
    ...(params.userId !== undefined && { userId: params.userId }),
    ...(params.nickname !== undefined && { nickname: params.nickname }),
  });

  return [
    `[addParticipant] 참가자 추가 완료`,
    `battleId : ${result.battleId}`,
    `userId   : ${result.userId}`,
    `team     : ${result.team}`,
    `nickname : ${result.nickname}`,
    `counts   : A=${result.counts.teamA}, B=${result.counts.teamB}, NONE=${result.counts.teamNone}`,
    `반영     : in-memory state · Redis · DB · 소켓 USER_UPDATED emit`,
  ].join('\n');
}
