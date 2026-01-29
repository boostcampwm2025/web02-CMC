import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: (error: Error, reset: () => void) => ReactNode;
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
