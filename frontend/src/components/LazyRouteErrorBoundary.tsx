import { Component, type ReactNode } from 'react';
import { reportError } from '../core/sentry';

type LazyRouteErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type LazyRouteErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class LazyRouteErrorBoundary extends Component<LazyRouteErrorBoundaryProps, LazyRouteErrorBoundaryState> {
  constructor(props: LazyRouteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): LazyRouteErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('Lazy route failed to load:', error, errorInfo);
    reportError(error, { react: { componentStack: errorInfo.componentStack } });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="page fade-in flex flex-col items-center justify-center min-h-screen gap-4 p-6">
          <h1 className="text-4xl font-bold">Unable to load this section</h1>
          <p className="card__subtitle text-center max-w-[600px]">
            This part of the application could not be loaded. Please check your connection and try again.
          </p>
          <button
            className="btn btn--primary"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Retry
          </button>
          <pre className="text-xs text-muted max-w-[600px] overflow-auto">
            {this.state.error?.message}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
