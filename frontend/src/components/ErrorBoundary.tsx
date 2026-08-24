import { Component, type ReactNode } from 'react';
import * as Sentry from '@sentry/react';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('Uncaught error:', error, errorInfo);
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="page fade-in flex flex-col items-center justify-center min-h-screen gap-4">
          <h1 className="text-4xl font-bold">Something went wrong</h1>
          <p className="card__subtitle">An unexpected error occurred. Please refresh the page.</p>
          <button className="btn btn--primary" onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
          <pre className="text-xs text-faint max-w-[600px] overflow-auto">
            {this.state.error?.message}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
