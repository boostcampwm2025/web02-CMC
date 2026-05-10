import { z } from 'zod';
import { postBackend } from '../clients/backend.js';

export const startBattleSchema = {
  battleId: z.string().min(1),
};

interface StartBattleResponse {
  battleId: string;
}

export async function startBattle(params: { battleId: string }): Promise<string> {
  const result = await postBackend<Record<string, never>, StartBattleResponse>(
    `/dev/battles/${params.battleId}/start`,
    {},
  );

  return [
    `[startBattle] 게임 시작 완료`,
    `battleId : ${result.battleId}`,
    `반영     : status=OPEN · PHASE_UPDATED/ROUND_UPDATED emit · PENDING→OPINION_SHARE 자동 advance · STARTED broadcast`,
  ].join('\n');
}
