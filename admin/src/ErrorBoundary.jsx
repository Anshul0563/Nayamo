import React from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state to show fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught error:', error, errorInfo);
    
    // Log to service (optional)
    if (process.env.NODE_ENV === 'production') {
      // window.analytics?.track('react_error', { error: error.message });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-24 h-24 bg-red-500/10 border-2 border-red-500/20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <AlertCircle size={48} className="text-red-400" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
              We're sorry for the inconvenience. Please refresh the page to continue.
            </p>
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-emerald/25 hover:-translate-y-1"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-3 px-6 rounded-2xl transition-all duration-300"
              >
                Go to Login
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-300">
                <summary className="font-medium cursor-pointer mb-2">Error Details</summary>
                <pre className="mt-2 p-3 bg-black/20 rounded-lg overflow-auto text-xs">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

