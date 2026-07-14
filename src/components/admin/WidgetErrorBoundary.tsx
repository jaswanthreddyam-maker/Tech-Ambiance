import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Widget caught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} />;
      }
      return (
        <div className="h-full w-full min-h-[120px] p-6 rounded-2xl bg-red-50/50 border border-red-200 flex flex-col items-center justify-center text-center">
          <AlertTriangle className="w-6 h-6 text-red-500 mb-2" />
          <h3 className="text-xs font-bold text-red-800 uppercase tracking-widest">Widget Error</h3>
          <p className="text-[10px] text-red-600 mt-1">{this.state.error?.message || 'Failed to load widget.'}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
