import { z } from 'zod';
import { getDb } from '../clients/db.js';
import type { BattleStatus, BattlePhaseName } from '@cmc/types';

export const findBattleSchema = {
  query: z.string().min(1).describe('배틀 제목 검색어 (부분 일치)'),
};

interface BattleRow {
  id: string;
  title: string;
  status: BattleStatus;
  current_phase: BattlePhaseName | null;
  current_round: number | null;
  started_at: Date | null;
  is_private: boolean;
}

export async function findBattle({ query }: { query: string }): Promise<string> {
  const db = getDb();

  const result = await db.query<BattleRow>(
    `SELECT id, title, status, current_phase, current_round, started_at, is_private
     FROM battles
     WHERE title ILIKE $1
     ORDER BY started_at DESC
     LIMIT 10`,
    [`%${query}%`],
  );

  if (result.rows.length === 0) {
    return `[결과 없음] "${query}"와 일치하는 배틀이 없습니다.`;
  }

  const lines: string[] = [`[find_battle] "${query}" 검색 결과 (${result.rows.length}건)`, ''];

  for (const row of result.rows) {
    lines.push(
      `battleId : ${row.id}`,
      `제목     : ${row.title}`,
      `status   : ${row.status}`,
      `phase    : ${row.current_phase ?? 'PENDING'}`,
      `round    : ${row.current_round ?? 1}`,
      `공개여부 : ${row.is_private ? '비공개' : '공개'}`,
      `시작일시 : ${row.started_at ? new Date(row.started_at).toISOString() : '미시작'}`,
      '',
    );
  }

  return lines.join('\n');
}
