import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import { useLocation, useNavigationType, createRoutesFromChildren, matchRoutes } from 'react-router-dom';

export const initSentry = () => {
  const enableSentry = import.meta.env.VITE_ENABLE_SENTRY === 'true';
  const isProduction = import.meta.env.MODE === 'production';
  const hasDSN = !!import.meta.env.VITE_SENTRY_DSN;

  if (hasDSN && (isProduction || enableSentry)) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      integrations: [
        Sentry.reactRouterV6BrowserTracingIntegration({
          useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        }),
        Sentry.replayIntegration()
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0
    });
  }
};
