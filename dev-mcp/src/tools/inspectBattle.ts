import { z } from 'zod';

export const inspectBattleSchema = {
  battleId: z.string().min(1),
};

interface InspectResponse {
  battleId: string;
  now: number;
  meta: {
    status: string;
    phase: string;
    phaseCount: number;
    round: number;
    totalRounds: number;
    currentTopic: string | null;
    topics: string[];
  };
  timer: {
    startedAt: number | null;
    expiredAt: number | null;
    remainingMs: number | null;
    zset: {
      registered: boolean;
      score: number | null;
      consistent: boolean;
      mismatch: string | null;
    };
  };
  participants: {
    total: number;
    teamA: { count: number; users: { userId: string; nickname: string | null }[] };
    teamB: { count: number; users: { userId: string; nickname: string | null }[] };
    teamNone: { count: number; users: { userId: string; nickname: string | null }[] };
  };
  teamVotes: { A: number; B: number; NONE: number; totalVoted: number };
  discussions: {
    all: { attacks: number; defenses: number };
    teamA: { attacks: number; defenses: number };
    teamB: { attacks: number; defenses: number };
    opinionHistory: number;
  };
  chats: { all: number; teamA: number; teamB: number };
  skipState: { count: number; userIds: string[] };
}

function fmtTime(ms: number | null): string {
  if (ms === null) return 'null';
  return new Date(ms).toISOString();
}

function fmtRemaining(ms: number | null): string {
  if (ms === null) return '없음';
  if (ms < 0) return `만료됨 (${Math.abs(Math.round(ms / 1000))}s 지남)`;
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  return `${min}m ${sec % 60}s`;
}

function fmtUsers(users: { userId: string; nickname: string | null }[]): string {
  if (users.length === 0) return '(없음)';
  return users.map(u => `${u.nickname ?? '?'}(${u.userId.slice(0, 8)})`).join(', ');
}

export async function inspectBattle({ battleId }: { battleId: string }): Promise<string> {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  const r = await fetch(`${backendUrl}/dev/battles/${battleId}/inspect`);
  const text = await r.text();
  if (!r.ok) throw new Error(`백엔드 응답 ${r.status}: ${text || r.statusText}`);

  const data = JSON.parse(text) as InspectResponse;

  const lines: string[] = [
    `[inspectBattle] battleId=${data.battleId}`,
    '',
    '── 메타 ──',
    `status        : ${data.meta.status}`,
    `phase         : ${data.meta.phase} (phaseCount ${data.meta.phaseCount})`,
    `round         : ${data.meta.round} / ${data.meta.totalRounds}`,
    `currentTopic  : ${data.meta.currentTopic ?? '(없음)'}`,
    '',
    '── 타이머 ──',
    `startedAt     : ${fmtTime(data.timer.startedAt)}`,
    `expiredAt     : ${fmtTime(data.timer.expiredAt)}`,
    `잔여          : ${fmtRemaining(data.timer.remainingMs)}`,
    `ZSET 등록     : ${data.timer.zset.registered ? `등록됨 (score=${data.timer.zset.score})` : '등록 안 됨'}`,
    `정합성        : ${data.timer.zset.consistent ? '✓ 일치' : `⚠️ ${data.timer.zset.mismatch}`}`,
    '',
    '── 참가자 ──',
    `total         : ${data.participants.total}`,
    `teamA (${data.participants.teamA.count}명) : ${fmtUsers(data.participants.teamA.users)}`,
    `teamB (${data.participants.teamB.count}명) : ${fmtUsers(data.participants.teamB.users)}`,
    `NONE  (${data.participants.teamNone.count}명) : ${fmtUsers(data.participants.teamNone.users)}`,
    '',
    '── 팀 투표 ──',
    `A=${data.teamVotes.A}, B=${data.teamVotes.B}, NONE=${data.teamVotes.NONE} (${data.teamVotes.totalVoted}/${data.participants.total} 투표)`,
    '',
    '── 토론 (현재 페이즈) ──',
    `attacks  : A팀 ${data.discussions.teamA.attacks}건, B팀 ${data.discussions.teamB.attacks}건`,
    `defenses : A팀 ${data.discussions.teamA.defenses}건, B팀 ${data.discussions.teamB.defenses}건`,
    `opinionHistory : 누적 ${data.discussions.opinionHistory}건`,
    '',
    '── 채팅 ──',
    `all   : ${data.chats.all}건`,
    `teamA : ${data.chats.teamA}건`,
    `teamB : ${data.chats.teamB}건`,
    '',
    '── 스킵 ──',
    `${data.skipState.count}/${data.participants.total} (${data.skipState.userIds.map(u => u.slice(0, 8)).join(', ') || '없음'})`,
  ];

  return lines.join('\n');
}
