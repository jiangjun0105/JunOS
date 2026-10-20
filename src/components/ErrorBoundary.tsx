'use client'

import { Component, type ReactNode } from 'react'

/**
 * Contains a crashing window body (a render bug, or a code-split chunk that 404s
 * after a deploy) so it doesn't blank the whole desktop. Callers key it per window,
 * so opening another window remounts it with a clean state. Must be a class:
 * error boundaries have no hook equivalent.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error('Window body crashed:', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="flex h-full items-center justify-center text-center">
        <p className="text-sm text-muted">This app couldn&apos;t load.</p>
      </div>
    )
  }
}
