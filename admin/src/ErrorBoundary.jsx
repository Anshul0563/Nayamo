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
    // Log to service (optional)
    if (process.env.NODE_ENV === 'production') {
      // window.analytics?.track('react_error', { error: error.message });
    } else {
      this.errorInfo = errorInfo;
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070708] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-[#111214] border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <AlertCircle size={48} className="text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
              We're sorry for the inconvenience. Please refresh the page to continue.
            </p>
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-[#D4A853] hover:bg-[#F0D78C] text-[#080808] font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300"
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
