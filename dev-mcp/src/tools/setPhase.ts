import { z } from 'zod';
import type { BattlePhaseName } from '@cmc/types';
import { postBackend } from '../clients/backend.js';

const PHASE_VALUES: [BattlePhaseName, ...BattlePhaseName[]] = [
  'PENDING',
  'OPINION_SHARE',
  'ATTACK',
  'DEFENSE',
  'TEAM_SWITCH',
];

export const setPhaseSchema = {
  battleId: z.string().min(1),
  phase: z.enum(PHASE_VALUES),
  durationMs: z.number().int().min(0).optional().describe('타이머 ms. 생략 시 페이즈 기본값.'),
  round: z.number().int().min(1).optional().describe('라운드 번호. 생략 시 현재 라운드 유지.'),
};

interface SetPhaseResponse {
  battleId: string;
  phase: string;
  durationMs: number | null;
  round: number | null;
}

export async function setPhase({
  battleId,
  phase,
  durationMs,
  round,
}: {
  battleId: string;
  phase: BattlePhaseName;
  durationMs?: number;
  round?: number;
}): Promise<string> {
  const result = await postBackend<
    { phase: BattlePhaseName; durationMs?: number; round?: number },
    SetPhaseResponse
  >(`/dev/battles/${battleId}/phase`, {
    phase,
    ...(durationMs !== undefined && { durationMs }),
    ...(round !== undefined && { round }),
  });

  return [
    `[setPhase] 페이즈 변경 완료`,
    `battleId : ${result.battleId}`,
    `phase    : ${result.phase}`,
    `round    : ${result.round !== null ? result.round : '현재 유지'}`,
    `타이머   : ${result.durationMs !== null ? `${result.durationMs}ms` : '페이즈 기본값'}`,
    `반영     : 백엔드 in-memory state · Redis · DB · 소켓 emit · timer 스케줄`,
  ].join('\n');
}
