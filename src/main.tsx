import { StrictMode, Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppProviders } from './providers'
import './index.css'
import App from './App.tsx'

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      return (
        <div className="min-h-screen w-full bg-[#FAF7F0] text-[#0B3027] flex flex-col items-center justify-center p-6 select-none">
          <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-[#C9A56A]/30 rounded-3xl p-8 shadow-[0_20px_60px_rgba(11,48,39,0.08)] text-center space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-[#0B3027]/10 flex items-center justify-center mx-auto text-[#0B3027] font-bold text-lg">
              HQ
            </div>
            <div className="space-y-2">
              <h1 className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#0B3027]">
                Something unexpected occurred
              </h1>
              <p className="text-sm text-[#0B3027]/70 leading-relaxed">
                We encountered an unexpected error while loading this page. Please try reloading the application.
              </p>
            </div>

            {isDev && (
              <div className="text-left bg-red-950/90 text-red-100 p-4 rounded-2xl text-xs font-mono overflow-auto max-h-48 space-y-2">
                <div className="font-bold">{this.state.error?.toString()}</div>
                <div className="opacity-75 text-[10px] leading-relaxed">{this.state.error?.stack}</div>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3.5 px-6 rounded-full bg-[#0B3027] text-[#FAF7F0] font-semibold text-xs uppercase tracking-widest hover:bg-[#0B3027]/90 transition-all shadow-md"
              >
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AppProviders>
          <App />
        </AppProviders>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
