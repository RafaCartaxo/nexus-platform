import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "./Button.js"

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 p-8 text-center">
          <h2 className="text-xl font-semibold text-text-primary">Algo deu errado</h2>
          <p className="text-sm text-text-secondary">
            {this.state.error?.message ?? "Ocorreu um erro inesperado."}
          </p>
          <Button onClick={this.handleRetry}>Tentar novamente</Button>
        </div>
      )
    }

    return this.props.children
  }
}
