import React from 'react'
import { AlertOctagon, RotateCcw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Jal Rakshak UI Error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  handleClearAndReload = () => {
    try {
      sessionStorage.clear()
      localStorage.removeItem('floodData')
    } catch {}
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-red-100 shadow-xl p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Something went wrong</h2>
            <p className="text-xs text-slate-500 mt-2">
              The flood intelligence dashboard encountered an unexpected error.
            </p>
            {this.state.error?.message && (
              <p className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-[11px] font-mono text-red-700 text-left overflow-auto max-h-24">
                {this.state.error.message}
              </p>
            )}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition shadow-lg shadow-brand-500/20 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
