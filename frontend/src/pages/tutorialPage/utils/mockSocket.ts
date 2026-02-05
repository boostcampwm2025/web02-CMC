import type { Socket } from 'socket.io-client';

type Handler = (...args: unknown[]) => void;

type HandlerMap = Map<string, Set<Handler>>;

export function createMockSocket(): Socket {
  const handlers: HandlerMap = new Map();

  const on = (event: string, handler: Handler) => {
    const set = handlers.get(event) ?? new Set();
    set.add(handler);
    handlers.set(event, set);
    return mockSocket;
  };

  const off = (event: string, handler?: Handler) => {
    if (!handler) {
      handlers.delete(event);
      return mockSocket;
    }

    const set = handlers.get(event);
    if (set) {
      set.delete(handler);
      if (set.size === 0) {
        handlers.delete(event);
      }
    }
    return mockSocket;
  };

  const once = (event: string, handler: Handler) => {
    const wrapper: Handler = (...args) => {
      handler(...args);
      off(event, wrapper);
    };
    return on(event, wrapper);
  };

  const emit = () => true;

  const removeAllListeners = () => {
    handlers.clear();
    return mockSocket;
  };

  const disconnect = () => mockSocket;

  const mockSocket = {
    on,
    off,
    once,
    emit,
    removeAllListeners,
    disconnect
  } as unknown as Socket;

  return mockSocket;
}
