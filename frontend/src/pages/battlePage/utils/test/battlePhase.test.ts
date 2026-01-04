import { describe, it, expect } from 'vitest';
import { isInputDisabled } from '../battlePhase';

describe('입력 가능 조건 검증', () => {
  it('A팀 공격 턴에 A팀은 입력 가능', () => {
    expect(isInputDisabled('A', 'TEAM_A_ATTACK', 'A_ATTACK')).toBe(false);
  });

  it('B팀 방어 턴에 B팀은 입력 가능', () => {
    expect(isInputDisabled('B', 'TEAM_A_ATTACK', 'B_DEFENSE')).toBe(false);
  });

  it('잘못된 턴에는 입력 불가', () => {
    expect(isInputDisabled('B', 'TEAM_A_ATTACK', 'A_ATTACK')).toBe(true);
  });
});
