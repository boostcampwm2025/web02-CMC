import { describe, it, expect, vi, afterEach } from 'vitest';
import { getTimeAgo } from '../getTimeAgo';

describe('getTimeAgo', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const setNow = (date: Date) => {
    vi.useFakeTimers();
    vi.setSystemTime(date);
  };

  const now = new Date('2025-06-01T12:00:00.000Z');

  it('60초 미만이면 "방금 전"을 반환한다', () => {
    setNow(now);
    const timestamp = new Date(now.getTime() - 30 * 1000).toISOString();
    expect(getTimeAgo(timestamp)).toBe('방금 전');
  });

  it('60분 미만이면 "N분 전"을 반환한다', () => {
    setNow(now);
    const timestamp = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    expect(getTimeAgo(timestamp)).toBe('5분 전');
  });

  it('24시간 미만이면 "N시간 전"을 반환한다', () => {
    setNow(now);
    const timestamp = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString();
    expect(getTimeAgo(timestamp)).toBe('3시간 전');
  });

  it('30일 미만이면 "N일 전"을 반환한다', () => {
    setNow(now);
    const timestamp = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    expect(getTimeAgo(timestamp)).toBe('7일 전');
  });

  it('12개월 미만이면 "N개월 전"을 반환한다', () => {
    setNow(now);
    const timestamp = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
    expect(getTimeAgo(timestamp)).toBe('3개월 전');
  });

  it('12개월 이상이면 "N년 전"을 반환한다', () => {
    setNow(now);
    const timestamp = new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000).toISOString();
    expect(getTimeAgo(timestamp)).toBe('1년 전');
  });
});
