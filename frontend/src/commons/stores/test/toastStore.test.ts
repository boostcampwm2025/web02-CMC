import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useToastStore, selectToasts, selectAddToast, selectRemoveToast, selectClearToasts } from '../toastStore';

describe('toastStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useToastStore.getState().clearToasts();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('addToast', () => {
    it('토스트를 추가한다', () => {
      useToastStore.getState().addToast({ message: '테스트 메시지' });
      const toasts = useToastStore.getState().toasts;

      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('테스트 메시지');
      expect(toasts[0].id).toBeDefined();
    });

    it('최대 3개까지만 유지한다', () => {
      const { addToast } = useToastStore.getState();
      addToast({ message: '1', duration: 0 });
      addToast({ message: '2', duration: 0 });
      addToast({ message: '3', duration: 0 });
      addToast({ message: '4', duration: 0 });

      const toasts = useToastStore.getState().toasts;
      expect(toasts).toHaveLength(3);
      expect(toasts[0].message).toBe('2');
      expect(toasts[2].message).toBe('4');
    });

    it('기본 3초 후 자동으로 제거된다', () => {
      useToastStore.getState().addToast({ message: '자동 삭제' });
      expect(useToastStore.getState().toasts).toHaveLength(1);

      vi.advanceTimersByTime(3000);
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it('커스텀 duration을 설정할 수 있다', () => {
      useToastStore.getState().addToast({ message: '커스텀', duration: 5000 });
      expect(useToastStore.getState().toasts).toHaveLength(1);

      vi.advanceTimersByTime(3000);
      expect(useToastStore.getState().toasts).toHaveLength(1);

      vi.advanceTimersByTime(2000);
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it('duration이 0이면 자동 삭제되지 않는다', () => {
      useToastStore.getState().addToast({ message: '영구', duration: 0 });

      vi.advanceTimersByTime(10000);
      expect(useToastStore.getState().toasts).toHaveLength(1);
    });
  });

  describe('removeToast', () => {
    it('ID로 특정 토스트를 제거한다', () => {
      useToastStore.getState().addToast({ message: '제거 대상', duration: 0 });
      const id = useToastStore.getState().toasts[0].id;

      useToastStore.getState().removeToast(id);
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });
  });

  describe('clearToasts', () => {
    it('모든 토스트를 제거한다', () => {
      const { addToast } = useToastStore.getState();
      addToast({ message: '1', duration: 0 });
      addToast({ message: '2', duration: 0 });

      useToastStore.getState().clearToasts();
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });
  });

  describe('selectors', () => {
    it('selectToasts가 토스트 배열을 반환한다', () => {
      useToastStore.getState().addToast({ message: '셀렉터', duration: 0 });
      const state = useToastStore.getState();
      expect(selectToasts(state)).toHaveLength(1);
    });

    it('selectAddToast가 함수를 반환한다', () => {
      const state = useToastStore.getState();
      expect(typeof selectAddToast(state)).toBe('function');
    });

    it('selectRemoveToast가 함수를 반환한다', () => {
      const state = useToastStore.getState();
      expect(typeof selectRemoveToast(state)).toBe('function');
    });

    it('selectClearToasts가 함수를 반환한다', () => {
      const state = useToastStore.getState();
      expect(typeof selectClearToasts(state)).toBe('function');
    });
  });
});
