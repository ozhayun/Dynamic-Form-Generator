import { Component, type ErrorInfo, type ReactNode } from 'react'

export interface AIPreviewErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary around the AI Preview to catch malformed JSON fragments
 * or invalid partial objects without crashing the dashboard.
 */
export class AIPreviewErrorBoundary extends Component<AIPreviewErrorBoundaryProps, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div
          className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
          role="alert"
        >
          <p className="font-medium">Preview error</p>
          <p className="mt-1 text-amber-200/80">{this.state.error.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}
