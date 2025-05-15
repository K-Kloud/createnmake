
import React from 'react';
import { Link } from 'react-router-dom';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Optionally log error to external service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="max-w-md w-full bg-card shadow p-8 rounded text-center">
            <h2 className="text-3xl font-bold mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">
              {this.state.error ? this.state.error.message : "An unexpected error has occurred."}
            </p>
            <div className="space-y-4">
              <button
                className="bg-primary text-primary-foreground px-5 py-2 rounded w-full"
                onClick={() => window.location.reload()}
              >
                Reload page
              </button>
              <Link to="/" className="block bg-secondary text-secondary-foreground px-5 py-2 rounded w-full">
                Return to home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
