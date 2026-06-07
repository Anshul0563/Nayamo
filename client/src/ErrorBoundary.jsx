import React from "react";
import { AlertCircle } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#070708] p-8">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111214] p-8 text-center shadow-2xl">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
              <AlertCircle size={48} className="text-red-400" />
            </div>
            <h1 className="mb-4 text-2xl font-bold text-white">
              Something went wrong
            </h1>
            <p className="mx-auto mb-8 max-w-sm leading-relaxed text-gray-400">
              Please refresh the page. Your cart and account data will stay safe.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full rounded-xl bg-[#D4A853] px-6 py-3 font-semibold text-[#080808] transition-colors duration-300 hover:bg-[#F0D78C]"
            >
              Reload Page
            </button>
            {process.env.NODE_ENV === "development" && (
              <details className="mt-8 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-left text-sm text-red-300">
                <summary className="cursor-pointer font-medium">
                  Error Details
                </summary>
                <pre className="mt-3 overflow-auto rounded-lg bg-black/20 p-3 text-xs">
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
