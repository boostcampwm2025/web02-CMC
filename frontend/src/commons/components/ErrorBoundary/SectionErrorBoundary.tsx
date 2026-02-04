import React, { Component, type ReactNode } from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
  fallback: (error: Error, reset: () => void) => ReactNode;
  section?: string; // 섹션 이름
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class SectionErrorBoundary extends Component<Props, State> {
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
    console.error('Section error:', error, errorInfo);

    const errorComponent = errorInfo.componentStack?.split('\n')[1]?.trim() || 'Unknown';

    Sentry.captureException(error, {
      level: 'warning',
      tags: {
        errorBoundary: 'section',
        section: this.props.section || 'unknown',
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

  reset = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return <div className="animate-fadeIn">{this.props.fallback(this.state.error, this.reset)}</div>;
    }

    return this.props.children;
  }
}
