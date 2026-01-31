import React, { Component, type ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import ErrorPage from '../../../pages/errorPage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorComponent = errorInfo.componentStack?.split('\n')[1]?.trim() || 'Unknown';

    Sentry.captureException(error, {
      level: 'error',
      tags: {
        errorBoundary: 'global',
        component: errorComponent
      },
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      },
      extra: {
        url: window.location.href,
        timestamp: new Date().toISOString(),
        errorMessage: error.message,
        errorName: error.name
      }
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage />;
    }

    return this.props.children;
  }
}
