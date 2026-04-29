import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { closeDb } from './clients/db.js';
import { closeRedis } from './clients/redis.js';

const server = new McpServer({
  name: 'cmc-battle-mcp',
  version: '0.0.1',
});

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
