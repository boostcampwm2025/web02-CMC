import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { closeDb } from './clients/db.js';
import { closeRedis } from './clients/redis.js';
import { findBattle, findBattleSchema } from './tools/findBattle.js';
import { setPhase, setPhaseSchema } from './tools/setPhase.js';
import { setTimer, setTimerSchema } from './tools/setTimer.js';
import { createTestBattle, createTestBattleSchema } from './tools/createTestBattle.js';
import { addParticipant, addParticipantSchema } from './tools/addParticipant.js';

const server = new McpServer({
  name: 'cmc-battle-mcp',
  version: '0.0.1',
});

server.tool(
  'find_battle',
  '배틀 제목 검색어로 battleId를 찾습니다. 다른 툴 사용 전 battleId를 모를 때 먼저 호출합니다.',
  findBattleSchema,
  async (params) => {
    try {
      return { content: [{ type: 'text', text: await findBattle(params) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `[오류] ${(err as Error).message}` }] };
    }
  },
);

server.tool(
  'setPhase',
  '배틀 페이즈를 강제로 변경합니다. 백엔드 dev API를 호출해 in-memory state·Redis·DB·소켓 emit·timer 스케줄을 모두 갱신합니다. durationMs 생략 시 페이즈 기본 시간 사용. (로컬 개발 전용)',
  setPhaseSchema,
  async (params) => {
    try {
      return { content: [{ type: 'text', text: await setPhase(params) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `[오류] ${(err as Error).message}` }] };
    }
  },
);

server.tool(
  'setTimer',
  '배틀 타이머만 강제로 변경합니다. 페이즈는 유지하고 만료 시각만 갱신합니다. (로컬 개발 전용)',
  setTimerSchema,
  async (params) => {
    try {
      return { content: [{ type: 'text', text: await setTimer(params) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `[오류] ${(err as Error).message}` }] };
    }
  },
);

server.tool(
  'createTestBattle',
  '테스트용 배틀을 빠르게 생성하고 접속 링크를 반환합니다. 모든 입력은 옵션이며 합리적 기본값으로 채워집니다. authorId 미지정 시 MCP_DEFAULT_AUTHOR_ID 또는 users 테이블 첫 행을 사용합니다. (로컬 개발 전용)',
  createTestBattleSchema,
  async (params) => {
    try {
      return { content: [{ type: 'text', text: await createTestBattle(params) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `[오류] ${(err as Error).message}` }] };
    }
  },
);

server.tool(
  'addParticipant',
  '배틀에 가짜 참가자를 강제로 추가합니다. 솔로 테스트 시 양 팀에 1명씩 채울 때 사용. userId/nickname 생략 시 자동 생성. team-vote도 자동으로 본인 팀에 투표 처리됩니다. (로컬 개발 전용)',
  addParticipantSchema,
  async (params) => {
    try {
      return { content: [{ type: 'text', text: await addParticipant(params) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `[오류] ${(err as Error).message}` }] };
    }
  },
);

async function shutdown() {
  await Promise.all([closeDb(), closeRedis()]);
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('CMC Battle MCP Server started\n');
}

main().catch((err: Error) => {
  process.stderr.write(`Fatal: ${err.message}\n`);
  process.exit(1);
});
