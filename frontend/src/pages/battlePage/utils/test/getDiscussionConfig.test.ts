import { describe, it, expect } from 'vitest';
import { getDiscussionConfig } from '../battlePhase';
import type { Team, BattlePhase } from '@/commons/types/battle';

describe('getDiscussionConfig', () => {
  it('A팀이 공격 턴일 때 이의제기 설정 반환', () => {
    const config = getDiscussionConfig('A' as Team, 'TEAM_A_ATTACK' as BattlePhase);

    expect(config.placeholderText).toBe('상대 진영에 이의제기...');
    expect(config.buttonText).toBe('이의제기');
    expect(config.isAttacking).toBe(true);
  });

  it('A팀이 방어 턴일 때 반론 설정 반환', () => {
    const config = getDiscussionConfig('A' as Team, 'TEAM_B_ATTACK' as BattlePhase);

    expect(config.placeholderText).toBe('상대 진영에 반론...');
    expect(config.buttonText).toBe('반론');
    expect(config.isAttacking).toBe(false);
  });

  it('B팀이 공격 턴일 때 이의제기 설정 반환', () => {
    const config = getDiscussionConfig('B' as Team, 'TEAM_B_ATTACK' as BattlePhase);

    expect(config.placeholderText).toBe('상대 진영에 이의제기...');
    expect(config.buttonText).toBe('이의제기');
    expect(config.isAttacking).toBe(true);
  });

  it('B팀이 방어 턴일 때 반론 설정 반환', () => {
    const config = getDiscussionConfig('B' as Team, 'TEAM_A_ATTACK' as BattlePhase);

    expect(config.placeholderText).toBe('상대 진영에 반론...');
    expect(config.buttonText).toBe('반론');
    expect(config.isAttacking).toBe(false);
  });
});
