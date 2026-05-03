import { z } from 'zod';
import { postBackend } from '../clients/backend.js';

export const injectDiscussionSchema = {
  battleId: z.string().min(1),
  type: z.enum(['attack', 'defense']).describe('attack=이의제기, defense=반론'),
  team: z.enum(['A', 'B']).describe('주입 대상 팀'),
  content: z.string().min(1),
  authorId: z.string().optional().describe('생략 시 해당 팀의 첫 참가자 사용'),
};

interface InjectDiscussionResponse {
  battleId: string;
  discussionId: string;
  type: string;
  team: string;
  authorId: string;
  nickname: string;
}

export async function injectDiscussion(params: {
  battleId: string;
  type: 'attack' | 'defense';
  team: 'A' | 'B';
  content: string;
  authorId?: string;
}): Promise<string> {
  const result = await postBackend<
    { type: 'attack' | 'defense'; team: 'A' | 'B'; content: string; authorId?: string },
    InjectDiscussionResponse
  >(`/dev/battles/${params.battleId}/discussion`, {
    type: params.type,
    team: params.team,
    content: params.content,
    ...(params.authorId !== undefined && { authorId: params.authorId }),
  });

  return [
    `[injectDiscussion] ${result.type === 'attack' ? '이의제기' : '반론'} 주입 완료`,
    `battleId     : ${result.battleId}`,
    `discussionId : ${result.discussionId}`,
    `team         : ${result.team}`,
    `authorId     : ${result.authorId}`,
    `nickname     : ${result.nickname}`,
    `반영         : in-memory state · Redis HASH · 소켓 emit (team room)`,
  ].join('\n');
}
