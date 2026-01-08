import { describe, it, expect } from 'vitest';
import { getDiscussionConfig } from '../battlePhase';
import type { Team, BattlePhase } from '@/commons/types/battle';

describe('getDiscussionConfig', () => {
  it('ATTACK 페이즈에는 이의제기 설정 반환', () => {
    const config = getDiscussionConfig('A' as Team, 'ATTACK' as BattlePhase);

    expect(config.placeholderText).toBe('상대 진영에 이의제기...');
    expect(config.buttonText).toBe('이의제기');
    expect(config.isAttacking).toBe(true);
  });

  it('DEFENSE 페이즈에는 반론 설정 반환', () => {
    const config = getDiscussionConfig('A' as Team, 'DEFENSE' as BattlePhase);

    expect(config.placeholderText).toBe('상대 진영에 반론...');
    expect(config.buttonText).toBe('반론');
    expect(config.isAttacking).toBe(false);
  });
});
