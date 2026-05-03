import type { RedisCore, BattleDiscussion, BattleChat } from '../types/battle.js';

export function parseRedisCore(raw: string): RedisCore | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.battleId) return null;
    return parsed as RedisCore;
  } catch {
    return null;
  }
}

export function parseAttacks(raw: string): { all: (BattleDiscussion | null)[]; opinionHistory: BattleDiscussion[] } {
  try {
    const parsed = JSON.parse(raw);
    return {
      all: Array.isArray(parsed?.all) ? parsed.all : [],
      opinionHistory: Array.isArray(parsed?.opinionHistory) ? parsed.opinionHistory : [],
    };
  } catch {
    return { all: [], opinionHistory: [] };
  }
}

export function parseDefenses(raw: string): { all: (BattleDiscussion | null)[] } {
  try {
    const parsed = JSON.parse(raw);
    return { all: Array.isArray(parsed?.all) ? parsed.all : [] };
  } catch {
    return { all: [] };
  }
}

export function parseChats(raw: string): BattleChat[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
