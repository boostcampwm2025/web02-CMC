import { describe, it, expect } from 'vitest';
import { getDiscussionConfig } from '../battlePhase';
import type { BattlePhase } from '@/commons/types/battle';

describe('getDiscussionConfig', () => {
  it('ATTACK 페이즈에는 이의제기 설정 반환', () => {
    const config = getDiscussionConfig('ATTACK' as BattlePhase);

    expect(config.placeholderText).toBe('상대 진영의 코드와 주장에 이의제기를 던지세요...');
    expect(config.hintText).toBe('상대 진영의 코드와 주장의 빈틈을 노려 반론을 던져보세요.');
    expect(config.buttonText).toBe('이의제기');
    expect(config.isAttacking).toBe(true);
    expect(config.isActive).toBe(true);
  });

  it('DEFENSE 페이즈에는 반박 설정 반환', () => {
    const config = getDiscussionConfig('DEFENSE' as BattlePhase);

    expect(config.placeholderText).toBe('상대 진영의 이의제기에 반박하세요...');
    expect(config.hintText).toBe('상대 진영의 이의제기에 대해 명확하게 반박해주세요.');
    expect(config.buttonText).toBe('반론');
    expect(config.isAttacking).toBe(false);
    expect(config.isActive).toBe(true);
  });
});
