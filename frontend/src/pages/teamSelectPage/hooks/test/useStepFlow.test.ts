import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStepFlow } from '../useStepFlow';

describe('useStepFlow', () => {
  it('초기 단계는 1이다', () => {
    const { result } = renderHook(() => useStepFlow());
    expect(result.current.currentStep).toBe(1);
  });

  it('goToNext 호출 시 단계가 1 증가한다', () => {
    const { result } = renderHook(() => useStepFlow());

    act(() => {
      result.current.goToNext();
    });

    expect(result.current.currentStep).toBe(2);
  });

  it('goToPrev 호출 시 단계가 1 감소한다', () => {
    const { result } = renderHook(() => useStepFlow());

    // 먼저 2단계로 이동
    act(() => {
      result.current.goToNext();
    });

    // 다시 1단계로
    act(() => {
      result.current.goToPrev();
    });

    expect(result.current.currentStep).toBe(1);
  });

  it('1단계에서 goToPrev 호출 시 단계가 변경되지 않는다', () => {
    const { result } = renderHook(() => useStepFlow());

    act(() => {
      result.current.goToPrev();
    });

    expect(result.current.currentStep).toBe(1);
  });

  it('4단계에서 goToNext 호출 시 단계가 변경되지 않는다', () => {
    const { result } = renderHook(() => useStepFlow());

    // 4단계로 이동
    act(() => {
      result.current.goToNext();
      result.current.goToNext();
      result.current.goToNext();
    });

    expect(result.current.currentStep).toBe(4);

    // 4단계에서 다음으로 이동 시도
    act(() => {
      result.current.goToNext();
    });

    expect(result.current.currentStep).toBe(4);
  });

  it('isFirstStep은 1단계일 때 true다', () => {
    const { result } = renderHook(() => useStepFlow());
    expect(result.current.isFirstStep).toBe(true);
  });

  it('isFirstStep은 1단계가 아닐 때 false다', () => {
    const { result } = renderHook(() => useStepFlow());

    act(() => {
      result.current.goToNext();
    });

    expect(result.current.isFirstStep).toBe(false);
  });

  it('isLastStep은 4단계일 때 true다', () => {
    const { result } = renderHook(() => useStepFlow());

    act(() => {
      result.current.goToNext();
      result.current.goToNext();
      result.current.goToNext();
    });

    expect(result.current.isLastStep).toBe(true);
  });

  it('isLastStep은 4단계가 아닐 때 false다', () => {
    const { result } = renderHook(() => useStepFlow());
    expect(result.current.isLastStep).toBe(false);
  });

  it('canGoNext는 4단계가 아닐 때 true다', () => {
    const { result } = renderHook(() => useStepFlow());
    expect(result.current.canGoNext).toBe(true);
  });

  it('canGoNext는 4단계일 때 false다', () => {
    const { result } = renderHook(() => useStepFlow());

    act(() => {
      result.current.goToNext();
      result.current.goToNext();
      result.current.goToNext();
    });

    expect(result.current.canGoNext).toBe(false);
  });
});
