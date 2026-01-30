
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary catches errors in the component tree.
 */
// Fix: Extending Component directly from named imports often resolves property inheritance detection issues in TypeScript class components.
class ErrorBoundary extends Component<Props, State> {
  // Fix: Initializing state as a class property helps resolve "Property 'state' does not exist" errors in certain TS configurations.
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    // Fix: Accessing state via this.state is now correctly typed as State.
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center">
            <h2 className="text-2xl font-black text-slate-900 mb-4">Oops! Heimdall has blinked.</h2>
            <p className="text-slate-500 mb-6 text-sm">A visual anomaly has occurred in the timestream. Please refresh the portal.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition-all"
            >
              Reset Timestream
            </button>
          </div>
        </div>
      );
    }

    // Fix: Using this.props.children now correctly resolves as it is inherited from Component<Props, State>.
    return this.props.children;
  }
}

export default ErrorBoundary;
