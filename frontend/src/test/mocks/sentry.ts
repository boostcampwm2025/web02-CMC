import { vi } from 'vitest';

vi.mock('@sentry/react', async () => {
  return {
    default: {
      setUser: vi.fn(),
      captureException: vi.fn(),
      captureMessage: vi.fn(),
      init: vi.fn()
    },
    setUser: vi.fn(),
    captureException: vi.fn(),
    captureMessage: vi.fn(),
    init: vi.fn()
  };
});
