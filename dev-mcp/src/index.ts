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
import { injectDiscussion, injectDiscussionSchema } from './tools/injectDiscussion.js';
import { injectVote, injectVoteSchema } from './tools/injectVote.js';
import { injectChat, injectChatSchema } from './tools/injectChat.js';
import { injectTeamVote, injectTeamVoteSchema } from './tools/injectTeamVote.js';
import { injectLeave, injectLeaveSchema } from './tools/injectLeave.js';
import { startBattle, startBattleSchema } from './tools/startBattle.js';
import { inspectBattle, inspectBattleSchema } from './tools/inspectBattle.js';

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

server.tool(
  'injectDiscussion',
  '이의제기(attack) 또는 반론(defense)을 강제로 주입합니다. 현재 페이즈와 type이 일치해야 합니다(ATTACK 페이즈→attack, DEFENSE 페이즈→defense). authorId 미지정 시 해당 팀 첫 참가자로 작성됩니다. 팀 룸에만 emit됩니다 (실제 흐름과 동일). (로컬 개발 전용)',
  injectDiscussionSchema,
  async (params) => {
    try {
      return { content: [{ type: 'text', text: await injectDiscussion(params) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `[오류] ${(err as Error).message}` }] };
    }
  },
);

server.tool(
  'injectVote',
  '이의제기(attack) 또는 반론(defense) discussion에 투표를 강제로 주입합니다. voterId 미지정 시 배틀 첫 참가자가 투표합니다. 팀 룸에 *_VOTED emit. (로컬 개발 전용)',
  injectVoteSchema,
  async (params) => {
    try {
      return { content: [{ type: 'text', text: await injectVote(params) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `[오류] ${(err as Error).message}` }] };
    }
  },
);

server.tool(
  'injectChat',
  '특정 유저 명의로 채팅을 강제로 전송합니다. scope=ALL이면 전체 채팅 룸, scope=TEAM이면 해당 유저의 팀 룸으로 broadcast. team은 state.participants에서 자동 추출. NONE 진영 유저는 TEAM scope 불가. (로컬 개발 전용)',
  injectChatSchema,
  async (params) => {
    try {
      return { content: [{ type: 'text', text: await injectChat(params) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `[오류] ${(err as Error).message}` }] };
    }
  },
);

server.tool(
  'injectTeamVote',
  '특정 유저의 진영 변경 투표를 강제로 주입합니다. 실제 흐름과 동일하게 broadcast 없이 state만 변경됩니다. TEAM_SWITCH 페이즈 진입 시 applyTeamSwitch가 ALL_UPDATED 한 번에 emit. (로컬 개발 전용)',
  injectTeamVoteSchema,
  async (params) => {
    try {
      return { content: [{ type: 'text', text: await injectTeamVote(params) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `[오류] ${(err as Error).message}` }] };
    }
  },
);

server.tool(
  'injectLeave',
  '특정 유저를 배틀에서 강제로 나가게 합니다. 참가자/팀 목록/투표/스킵 상태에서 제거 후 LEAVED broadcast. 잔여 참가자 모두 skip 상태면 자동 페이즈 advance. (로컬 개발 전용)',
  injectLeaveSchema,
  async (params) => {
    try {
      return { content: [{ type: 'text', text: await injectLeave(params) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `[오류] ${(err as Error).message}` }] };
    }
  },
);

server.tool(
  'startBattle',
  '배틀을 시작합니다. status를 OPEN으로 변경하고 PENDING→OPINION_SHARE로 자동 advance. PHASE_UPDATED/ROUND_UPDATED/STARTED broadcast. 가짜 참가자 양 팀 채운 후 호출하면 솔로 테스트에서도 진행 가능. (로컬 개발 전용)',
  startBattleSchema,
  async (params) => {
    try {
      return { content: [{ type: 'text', text: await startBattle(params) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `[오류] ${(err as Error).message}` }] };
    }
  },
);

server.tool(
  'inspectBattle',
  '배틀의 현재 백엔드 상태(liveStates)를 한 번에 덤프합니다. phase/round/타이머 잔여/참가자/팀투표/토론·채팅 카운트/스킵까지. 디버깅 시작점. (로컬 개발 전용)',
  inspectBattleSchema,
  async (params) => {
    try {
      return { content: [{ type: 'text', text: await inspectBattle(params) }] };
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
