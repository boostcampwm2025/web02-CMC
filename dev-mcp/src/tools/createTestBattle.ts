import { z } from 'zod';
import { postBackend } from '../clients/backend.js';
import { getDb } from '../clients/db.js';

const DEFAULT_CODE_A = `function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}`;

const DEFAULT_CODE_B = `function sum(arr: number[]): number {
  let total = 0;
  for (const n of arr) total += n;
  return total;
}`;

const PLAYTIME_TOPICS: Record<'FIFTEEN_MIN' | 'THIRTY_MIN', string[]> = {
  FIFTEEN_MIN: ['유지보수성'],
  THIRTY_MIN: ['유지보수성', '성능'],
};

export const createTestBattleSchema = {
  title: z.string().min(1).optional().describe('기본 "temp"'),
  type: z.enum(['PUBLIC', 'PRIVATE']).optional().describe('기본 PUBLIC'),
  language: z.enum(['TS', 'JS', 'PYTHON']).optional().describe('기본 TS'),
  category: z.enum(['ALGORITHM', 'REFACTORING', 'IMPLEMENT', 'ETC']).optional().describe('기본 ALGORITHM'),
  playTime: z.enum(['FIFTEEN_MIN', 'THIRTY_MIN']).optional().describe('기본 FIFTEEN_MIN(1라운드)'),
  topics: z.array(z.string().min(1)).optional().describe('생략 시 playTime별 기본값'),
  authorId: z.string().min(1).optional().describe('생략 시 MCP_DEFAULT_AUTHOR_ID 또는 users 테이블 첫 행'),
  codeA: z.string().optional(),
  codeB: z.string().optional(),
};

interface CreateBattleResponse {
  battleId: string;
  inviteCode: string | null;
}

async function resolveAuthorId(explicit?: string): Promise<string> {
  if (explicit) return explicit;
  if (process.env.MCP_DEFAULT_AUTHOR_ID) return process.env.MCP_DEFAULT_AUTHOR_ID;

  const db = getDb();
  const result = await db.query<{ id: string }>('SELECT id FROM users LIMIT 1');
  if (result.rows.length === 0) {
    throw new Error('users 테이블이 비어 있습니다. authorId를 명시하거나 먼저 OAuth 로그인 한 번 수행하세요.');
  }
  return result.rows[0].id;
}

export async function createTestBattle(params: {
  title?: string;
  type?: 'PUBLIC' | 'PRIVATE';
  language?: 'TS' | 'JS' | 'PYTHON';
  category?: 'ALGORITHM' | 'REFACTORING' | 'IMPLEMENT' | 'ETC';
  playTime?: 'FIFTEEN_MIN' | 'THIRTY_MIN';
  topics?: string[];
  authorId?: string;
  codeA?: string;
  codeB?: string;
}): Promise<string> {
  const playTime = params.playTime ?? 'FIFTEEN_MIN';
  const type = params.type ?? 'PUBLIC';
  const authorId = await resolveAuthorId(params.authorId);
  const topics = params.topics ?? PLAYTIME_TOPICS[playTime];

  const payload = {
    authorId,
    title: params.title ?? 'temp',
    description: 'MCP createTestBattle로 생성된 테스트 배틀',
    aCode: params.codeA ?? DEFAULT_CODE_A,
    bCode: params.codeB ?? DEFAULT_CODE_B,
    language: params.language ?? 'TS',
    type,
    category: params.category ?? 'ALGORITHM',
    playTime,
    topics,
  };

  const result = await postBackend<typeof payload, CreateBattleResponse>('/battles', payload);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

  const lines = [
    '[createTestBattle] 생성 완료',
    `battleId    : ${result.battleId}`,
    `title       : ${payload.title}`,
    `type        : ${type}`,
    `playTime    : ${playTime} (${topics.length}라운드)`,
    `topics      : ${topics.join(', ')}`,
    `authorId    : ${authorId}`,
    '',
    '링크',
    `  team-select : ${frontendUrl}/battle/${result.battleId}/team-select`,
    `  result      : ${frontendUrl}/battles/${result.battleId}/result`,
  ];

  if (result.inviteCode) {
    lines.push(`  inviteCode  : ${result.inviteCode}`);
    lines.push(`  초대 링크   : ${backendUrl}/battles/${result.inviteCode}`);
    lines.push('              (클릭 시 inviteAccess 쿠키 set + team-select 303 redirect)');
  }

  lines.push('');
  lines.push('AI 참고 자료는 생성 usecase 내에서 await로 동기 생성. 실패해도 null로 진행.');

  return lines.join('\n');
}
