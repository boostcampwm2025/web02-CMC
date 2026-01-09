import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCodeHover } from '../useCodeHover';

describe('useCodeHover', () => {
  it('초기 hoveredCode는 null이다', () => {
    const { result } = renderHook(() => useCodeHover());
    expect(result.current.hoveredCode).toBeNull();
  });

  it('handleHover 호출 시 hoveredCode가 업데이트된다', () => {
    const { result } = renderHook(() => useCodeHover());

    act(() => {
      result.current.handleHover('A');
    });

    expect(result.current.hoveredCode).toBe('A');
  });

  it('handleLeave 호출 시 hoveredCode가 null로 초기화된다', () => {
    const { result } = renderHook(() => useCodeHover());

    act(() => {
      result.current.handleHover('A');
    });

    expect(result.current.hoveredCode).toBe('A');

    act(() => {
      result.current.handleLeave();
    });

    expect(result.current.hoveredCode).toBeNull();
  });

  it('getCodeWidth: hoveredCode가 null일 때 50%를 반환한다', () => {
    const { result } = renderHook(() => useCodeHover());
    expect(result.current.getCodeWidth('A')).toBe('50%');
    expect(result.current.getCodeWidth('B')).toBe('50%');
  });

  it('getCodeWidth: hoveredCode와 같은 코드일 때 70%를 반환한다', () => {
    const { result } = renderHook(() => useCodeHover());

    act(() => {
      result.current.handleHover('A');
    });

    expect(result.current.getCodeWidth('A')).toBe('70%');
  });

  it('getCodeWidth: hoveredCode와 다른 코드일 때 30%를 반환한다', () => {
    const { result } = renderHook(() => useCodeHover());

    act(() => {
      result.current.handleHover('A');
    });

    expect(result.current.getCodeWidth('B')).toBe('30%');
  });

  it('B 코드에 호버 시 B는 70%, A는 30%를 반환한다', () => {
    const { result } = renderHook(() => useCodeHover());

    act(() => {
      result.current.handleHover('B');
    });

    expect(result.current.getCodeWidth('B')).toBe('70%');
    expect(result.current.getCodeWidth('A')).toBe('30%');
  });
});
