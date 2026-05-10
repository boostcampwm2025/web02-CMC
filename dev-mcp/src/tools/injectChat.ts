import { z } from 'zod';
import { postBackend } from '../clients/backend.js';

export const injectChatSchema = {
  battleId: z.string().min(1),
  userId: z.string().min(1).describe('채팅 보낼 유저 ID. 배틀 참가자여야 함'),
  scope: z.enum(['ALL', 'TEAM']).describe('ALL=전체 채팅, TEAM=팀 채팅 (NONE 진영 불가)'),
  text: z.string().min(1).max(500),
};

interface InjectChatResponse {
  battleId: string;
  messageId: string;
  scope: string;
  team: string;
  userId: string;
  nickname: string;
}

export async function injectChat(params: {
  battleId: string;
  userId: string;
  scope: 'ALL' | 'TEAM';
  text: string;
}): Promise<string> {
  const result = await postBackend<
    { userId: string; scope: 'ALL' | 'TEAM'; text: string },
    InjectChatResponse
  >(`/dev/battles/${params.battleId}/chat`, {
    userId: params.userId,
    scope: params.scope,
    text: params.text,
  });

  return [
    `[injectChat] 채팅 전송 완료`,
    `battleId  : ${result.battleId}`,
    `messageId : ${result.messageId}`,
    `scope     : ${result.scope}`,
    `team      : ${result.team}`,
    `userId    : ${result.userId}`,
    `nickname  : ${result.nickname}`,
    `반영      : in-memory state · Redis · DB · 소켓 CHATTED emit (scope 룸)`,
  ].join('\n');
}
