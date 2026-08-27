import React from 'react';

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-600 mb-4 max-w-xs">
            An unexpected error occurred. This is a prototype — please refresh the page to continue.
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            className="px-4 py-2 bg-epfo-blue text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
          {this.state.error && (
            <p className="text-[10px] text-slate-400 mt-4 font-mono break-all">{this.state.error.message}</p>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
