import { describe, it, expect } from 'vitest';
import { MOCK_TIMELINES } from '../mockTimeline';

describe('mockTimeline', () => {
  it('타임라인 목데이터가 존재한다', () => {
    expect(MOCK_TIMELINES).toBeDefined();
    expect(Array.isArray(MOCK_TIMELINES)).toBe(true);
  });

  it('타임라인 아이템이 1개 이상 존재한다', () => {
    expect(MOCK_TIMELINES.length).toBeGreaterThan(0);
  });

  it('각 타임라인 아이템은 필수 필드를 가진다', () => {
    MOCK_TIMELINES.forEach((item) => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('type');
      expect(item).toHaveProperty('team');
      expect(item).toHaveProperty('author');
      expect(item).toHaveProperty('content');
      expect(item).toHaveProperty('upvotes');
      expect(item).toHaveProperty('timestamp');
    });
  });

  it('type은 ATTACK 또는 DEFENSE만 가능하다', () => {
    MOCK_TIMELINES.forEach((item) => {
      expect(['ATTACK', 'DEFENSE']).toContain(item.type);
    });
  });

  it('team은 A 또는 B만 가능하다', () => {
    MOCK_TIMELINES.forEach((item) => {
      expect(['A', 'B']).toContain(item.team);
    });
  });

  it('upvotes는 0 이상의 숫자다', () => {
    MOCK_TIMELINES.forEach((item) => {
      expect(item.upvotes).toBeGreaterThanOrEqual(0);
      expect(typeof item.upvotes).toBe('number');
    });
  });

  it('timestamp는 숫자다', () => {
    MOCK_TIMELINES.forEach((item) => {
      expect(typeof item.timestamp).toBe('number');
    });
  });

  it('ATTACK과 DEFENSE 타입이 모두 포함되어 있다', () => {
    const types = MOCK_TIMELINES.map((item) => item.type);
    expect(types).toContain('ATTACK');
    expect(types).toContain('DEFENSE');
  });

  it('A팀과 B팀이 모두 포함되어 있다', () => {
    const teams = MOCK_TIMELINES.map((item) => item.team);
    expect(teams).toContain('A');
    expect(teams).toContain('B');
  });
});
