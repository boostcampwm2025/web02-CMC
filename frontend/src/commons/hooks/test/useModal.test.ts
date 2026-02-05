import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useModal from '../useModal';

describe('useModal', () => {
  it('기본값은 닫힌 상태이다', () => {
    const { result } = renderHook(() => useModal());
    expect(result.current.isOpen).toBe(false);
  });

  it('initialState로 열린 상태로 시작할 수 있다', () => {
    const { result } = renderHook(() => useModal(true));
    expect(result.current.isOpen).toBe(true);
  });

  it('openModal을 호출하면 열린다', () => {
    const { result } = renderHook(() => useModal());

    act(() => {
      result.current.openModal();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('closeModal을 호출하면 닫힌다', () => {
    const { result } = renderHook(() => useModal(true));

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('openModal과 closeModal을 반복 호출할 수 있다', () => {
    const { result } = renderHook(() => useModal());

    act(() => result.current.openModal());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.closeModal());
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.openModal());
    expect(result.current.isOpen).toBe(true);
  });
});
