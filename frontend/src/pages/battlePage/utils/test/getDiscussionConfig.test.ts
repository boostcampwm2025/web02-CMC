import { describe, it, expect } from 'vitest';
import { getDiscussionConfig } from '../battlePhase';
import type { BattlePhase } from '@/commons/types/battle';

describe('getDiscussionConfig', () => {
  it('ATTACK 페이즈에는 이의제기 설정 반환', () => {
    const config = getDiscussionConfig('ATTACK' as BattlePhase);

    expect(config.label).toBe('이의제기');
    expect(config.placeholderText).toBe('상대 코드의 허점을 찾아 이의 제기하세요');
    expect(config.buttonText).toBe('이의제기하기');
    expect(config.isAttacking).toBe(true);
    expect(config.isActive).toBe(true);
    expect(config.colors).toBeDefined();
    expect(config.colors.iconBox).toContain('red');
    expect(config.colors.glowBorder).toBe('border-red-500');
  });

  it('DEFENSE 페이즈에는 반박 설정 반환', () => {
    const config = getDiscussionConfig('DEFENSE' as BattlePhase);

    expect(config.label).toBe('반론');
    expect(config.placeholderText).toBe('상대 주장에 논리적으로 반박해 보세요');
    expect(config.buttonText).toBe('반론하기');
    expect(config.isAttacking).toBe(false);
    expect(config.isActive).toBe(true);
    expect(config.colors).toBeDefined();
    expect(config.colors.iconBox).toContain('blue');
    expect(config.colors.glowBorder).toBe('border-blue-500');
  });

  it('ATTACK/DEFENSE 외 페이즈에는 비활성 설정 반환', () => {
    const config = getDiscussionConfig('OPINION_SHARE' as BattlePhase);

    expect(config.label).toBe('');
    expect(config.placeholderText).toBe('');
    expect(config.buttonText).toBe('');
    expect(config.isAttacking).toBe(false);
    expect(config.isActive).toBe(false);
  });
});
