import { describe, it, expect } from 'vitest';
import { isInputDisabled } from '@/features/battle/utils/battlePhase';

describe('입력 가능 조건 검증', () => {
  it('ATTACK 페이즈에 팀 선택이 있으면 입력 가능', () => {
    expect(isInputDisabled('A', 'ATTACK')).toBe(false);
  });

  it('DEFENSE 페이즈에 팀 선택이 있으면 입력 가능', () => {
    expect(isInputDisabled('B', 'DEFENSE')).toBe(false);
  });

  it('OPINION_SHARE에서는 입력 불가', () => {
    expect(isInputDisabled('A', 'OPINION_SHARE')).toBe(true);
  });

  it('TEAM_SWITCH에서는 입력 불가', () => {
    expect(isInputDisabled('A', 'TEAM_SWITCH')).toBe(true);
  });
});
