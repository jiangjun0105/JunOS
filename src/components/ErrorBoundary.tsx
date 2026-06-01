'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'

/**
 * A render error boundary scoped to a single window's body.
 *
 * Why this exists: window bodies are arbitrary app components, and articles are
 * lazy-loaded MDX (`dynamic(..., { ssr: false })`). If a body throws while
 * rendering — a bug, or a code-split chunk that 404s after a deploy — the error
 * would otherwise bubble up through Framer's `<AnimatePresence>` and unmount the
 * ENTIRE desktop (every window, the menu bar, the lot). Wrapping just the body in
 * a boundary contains the blast radius: one app crashes, the rest keep working.
 *
 * It MUST be a class component — `getDerivedStateFromError` / `componentDidCatch`
 * have no hook equivalent in React 19. There's deliberately no "retry" button:
 * each `<Window>` is keyed by `win.id` in OSRoot, so closing and reopening the
 * window remounts a fresh boundary with a clean `hasError`, which is the natural
 * recovery path.
 */
interface ErrorBoundaryProps {
  children: ReactNode
  /** Optional custom fallback; defaults to a small, on-brand in-window message. */
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  // Flip to the fallback on the next render once a child throws.
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  // Surface the error for debugging (it never reaches the console on its own once
  // it's caught here). Kept side-effect-only so it works without a logging service.
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Window body crashed:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) return this.props.fallback
      // Default fallback: centered, muted, fills the body area — no new CSS needed.
      return (
        <div className="flex h-full items-center justify-center text-center">
          <p className="text-sm text-muted">This app couldn&apos;t load.</p>
        </div>
      )
    }

    return this.props.children
  }
}
