import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { closeDb } from './clients/db.js';
import { closeRedis } from './clients/redis.js';
import { findBattle, findBattleSchema } from './tools/findBattle.js';
import { setPhase, setPhaseSchema } from './tools/setPhase.js';
import { setTimer, setTimerSchema } from './tools/setTimer.js';

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
