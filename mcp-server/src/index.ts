import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { closeDb } from './clients/db.js';
import { closeRedis } from './clients/redis.js';
import { findBattle, findBattleSchema } from './tools/findBattle.js';

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
