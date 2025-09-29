import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error("UI error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0D12] text-neutral-200 flex items-center justify-center p-6">
          <div className="max-w-lg text-center">
            <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-sm text-neutral-400 mb-4">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => location.reload()}
              className="px-3 py-2 rounded-md bg-indigo-500/10 hover:bg-indigo-500/15 ring-1 ring-inset ring-indigo-500/30 text-indigo-200 transition"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


