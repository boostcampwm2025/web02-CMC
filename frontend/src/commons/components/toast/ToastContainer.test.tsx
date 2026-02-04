import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { ToastContainer } from './ToastContainer';
import { useToastStore } from '@/commons/stores/toastStore';

describe('ToastContainer', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('토스트가 없을 때 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<ToastContainer />);
    expect(container.querySelector('.fixed')).toBeInTheDocument();
    expect(screen.queryByText(/./)).not.toBeInTheDocument();
  });

  it('토스트를 추가하면 화면에 표시된다', () => {
    render(<ToastContainer />);

    act(() => {
      useToastStore.getState().addToast({ message: '테스트 메시지' });
    });

    expect(screen.getByText('테스트 메시지')).toBeInTheDocument();
  });

  it('여러 개의 토스트를 추가할 수 있다', () => {
    render(<ToastContainer />);

    act(() => {
      useToastStore.getState().addToast({ message: '첫 번째 메시지' });
      useToastStore.getState().addToast({ message: '두 번째 메시지' });
      useToastStore.getState().addToast({ message: '세 번째 메시지' });
    });

    expect(screen.getByText('첫 번째 메시지')).toBeInTheDocument();
    expect(screen.getByText('두 번째 메시지')).toBeInTheDocument();
    expect(screen.getByText('세 번째 메시지')).toBeInTheDocument();
  });

  it('최대 3개까지만 표시된다', () => {
    render(<ToastContainer />);

    act(() => {
      useToastStore.getState().addToast({ message: '첫 번째' });
      useToastStore.getState().addToast({ message: '두 번째' });
      useToastStore.getState().addToast({ message: '세 번째' });
      useToastStore.getState().addToast({ message: '네 번째' });
    });

    // 첫 번째는 제거되고 나머지 3개만 표시
    expect(screen.queryByText('첫 번째')).not.toBeInTheDocument();
    expect(screen.getByText('두 번째')).toBeInTheDocument();
    expect(screen.getByText('세 번째')).toBeInTheDocument();
    expect(screen.getByText('네 번째')).toBeInTheDocument();
  });

  it('duration- 3초 뒤에 자동으로 제거된다', () => {
    render(<ToastContainer />);

    act(() => {
      useToastStore.getState().addToast({ message: '자동 제거 메시지', duration: 3000 });
    });

    expect(screen.getByText('자동 제거 메시지')).toBeInTheDocument();

    // 3초 경과
    act(() => {
      vi.runAllTimers();
    });

    expect(screen.queryByText('자동 제거 메시지')).not.toBeInTheDocument();
  });

  it('ESC 키를 누르면 가장 최근 토스트가 제거된다', () => {
    render(<ToastContainer />);

    act(() => {
      useToastStore.getState().addToast({ message: '첫 번째' });
      useToastStore.getState().addToast({ message: '두 번째' });
    });

    expect(screen.getByText('첫 번째')).toBeInTheDocument();
    expect(screen.getByText('두 번째')).toBeInTheDocument();

    // ESC 키 누르기
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
    });

    expect(screen.getByText('첫 번째')).toBeInTheDocument();
    expect(screen.queryByText('두 번째')).not.toBeInTheDocument();
  });

  it('removeToast를 호출하면 특정 토스트가 제거된다', () => {
    render(<ToastContainer />);

    let firstToastId: string;

    act(() => {
      useToastStore.getState().addToast({ message: '제거할 메시지' });
      const toasts = useToastStore.getState().toasts;
      firstToastId = toasts[0].id;
    });

    expect(screen.getByText('제거할 메시지')).toBeInTheDocument();

    act(() => {
      useToastStore.getState().removeToast(firstToastId);
    });

    expect(screen.queryByText('제거할 메시지')).not.toBeInTheDocument();
  });
});
