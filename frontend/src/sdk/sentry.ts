import * as Sentry from '@sentry/react';

export const initSentry = () => {
  const enableSentry = import.meta.env.VITE_ENABLE_SENTRY === 'true';
  const isProduction = import.meta.env.MODE === 'production';
  const hasDSN = !!import.meta.env.VITE_SENTRY_DSN;

  if (hasDSN && (isProduction || enableSentry)) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      integrations: [Sentry.replayIntegration()],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0
    });
  }
};
