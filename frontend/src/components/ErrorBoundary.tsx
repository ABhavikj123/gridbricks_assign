import { Component, type ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  failed: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="error-page">
          <AlertCircle size={32} />
          <h1>Unable to render the dashboard</h1>
          <p>The dashboard received data it could not display.</p>
          <button onClick={() => window.location.reload()}>
            <RefreshCw size={16} />
            Reload dashboard
          </button>
        </main>
      )
    }

    return this.props.children
  }
}