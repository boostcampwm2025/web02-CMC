import { Battle } from '../../../domains/models/types/battle.types'

export interface BattleUtilPort {
  generateId(): string
  generateInviteCode(): string
  shuffleTopics(topics: string[], playTime: string): string[]
  toBattleEntity(record: unknown, participantCount: number): Battle
  buildOpenBattleList(records: unknown[]): unknown[]
  buildClosedBattleList(records: unknown[], resultBuilder: unknown): unknown[]
  getBattleRoomId(battleId: string, team?: string): string
}
