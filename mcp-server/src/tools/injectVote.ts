import { z } from 'zod';
import { postBackend } from '../clients/backend.js';

export const injectVoteSchema = {
  battleId: z.string().min(1),
  type: z.enum(['attack', 'defense']).describe('투표 대상 타입'),
  team: z.enum(['A', 'B']).describe('투표 대상 discussion이 속한 팀'),
  discussionId: z.string().min(1),
  voterId: z.string().optional().describe('생략 시 배틀의 첫 참가자 사용'),
};

interface InjectVoteResponse {
  battleId: string;
  discussionId: string;
  type: string;
  team: string;
  voterId: string;
  updatedCount: number;
}

export async function injectVote(params: {
  battleId: string;
  type: 'attack' | 'defense';
  team: 'A' | 'B';
  discussionId: string;
  voterId?: string;
}): Promise<string> {
  const result = await postBackend<
    { type: 'attack' | 'defense'; team: 'A' | 'B'; discussionId: string; voterId?: string },
    InjectVoteResponse
  >(`/dev/battles/${params.battleId}/vote`, {
    type: params.type,
    team: params.team,
    discussionId: params.discussionId,
    ...(params.voterId !== undefined && { voterId: params.voterId }),
  });

  return [
    `[injectVote] ${result.type === 'attack' ? '이의제기' : '반론'} 투표 완료`,
    `battleId     : ${result.battleId}`,
    `discussionId : ${result.discussionId}`,
    `team         : ${result.team}`,
    `voterId      : ${result.voterId}`,
    `반영 건수    : ${result.updatedCount} (이전 투표 취소 + 새 투표)`,
    `반영         : Redis Lua · in-memory state · 소켓 ${result.type.toUpperCase()}_VOTED emit`,
  ].join('\n');
}
