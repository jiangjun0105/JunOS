'use client'

import { useState } from 'react'

/**
 * "Email" app — a Gmail-style compose window for writing to Jun.
 *
 * The recipient is FIXED to jiangjun0105@gmail.com: this is a "message Jun"
 * form, not a general mail client. A visitor fills in their own address (the
 * sender), a subject, and the message body.
 *
 * FRONTEND ONLY for now. `handleSubmit` validates (native required + type=email)
 * and shows a confirmation, but does NOT deliver anything yet — wiring it to a
 * real send is the next step; the marked TODO is where that call goes.
 */

/** Where every message from this app is addressed. Not user-editable. */
const RECIPIENT = 'jiangjun0105@gmail.com'

export function EmailWindow() {
  const [from, setFrom] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  // 'idle' → composing; 'ready' → passed client-side validation (backend pending).
  const [status, setStatus] = useState<'idle' | 'ready'>('idle')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // TODO(backend): send { to: RECIPIENT, from, subject, body } to an API route
    // (e.g. POST /api/email) that delivers the mail, then reflect success/error
    // here instead of just flipping to 'ready'.
    setStatus('ready')
  }

  // Any edit after a confirmation drops back to composing, so the banner never
  // lingers over a message the user has since changed.
  const onEdit =
    (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(e.target.value)
      setStatus('idle')
    }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-full flex-col">
      {/* The window title bar already says "Email", so this header just sets the
          compose context and hints at why the recipient is fixed. */}
      <header className="flex items-start gap-2.5 pb-3">
        <span className="mt-0.5 text-accent">
          <EnvelopeGlyph />
        </span>
        <div>
          <h1 className="font-display text-[20px] font-bold leading-tight text-ink">New Message</h1>
          <p className="text-[14px] text-muted">Send a note straight to Jun&rsquo;s inbox.</p>
        </div>
      </header>

      {/* To — fixed recipient, shown as a locked chip (not an input). */}
      <div className="flex items-center gap-3 border-b border-line/70 py-2.5">
        <span className="w-16 shrink-0 font-display text-[14px] font-semibold uppercase tracking-wide text-muted">
          To
        </span>
        <span
          title="Messages from this app always go to Jun"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[15px] text-ink"
        >
          <LockGlyph />
          {RECIPIENT}
        </span>
      </div>

      {/* From — the sender's own address. */}
      <div className="flex items-center gap-3 border-b border-line/70 py-2.5 transition-colors focus-within:border-accent">
        <label htmlFor="email-from" className={labelClass}>
          From
        </label>
        <input
          id="email-from"
          type="email"
          required
          autoComplete="email"
          value={from}
          onChange={onEdit(setFrom)}
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      {/* Subject */}
      <div className="flex items-center gap-3 border-b border-line/70 py-2.5 transition-colors focus-within:border-accent">
        <label htmlFor="email-subject" className={labelClass}>
          Subject
        </label>
        <input
          id="email-subject"
          type="text"
          required
          value={subject}
          onChange={onEdit(setSubject)}
          placeholder="What&rsquo;s this about?"
          className={inputClass}
        />
      </div>

      {/* Message body — grows to fill the window. */}
      <textarea
        id="email-body"
        aria-label="Message"
        required
        value={body}
        onChange={onEdit(setBody)}
        placeholder="Write your message&hellip;"
        className="mt-3 min-h-[150px] w-full flex-1 resize-none rounded-md bg-transparent text-[16px] leading-relaxed text-ink placeholder:text-muted/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
      />

      {/* Footer: send + an honest status line (no real delivery yet). */}
      <footer className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line/70 pt-3">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-tile border border-ink bg-accent px-5 py-2 font-display text-[16px] font-bold uppercase tracking-wide text-surface shadow-soft transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          Send
          <SendGlyph />
        </button>

        {status === 'ready' ? (
          <p className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent-2">
            <span aria-hidden>✓</span>
            Looks good! Delivery isn&rsquo;t connected yet — the backend is next.
          </p>
        ) : (
          <p className="text-[13px] text-muted">Goes to {RECIPIENT}. Sending isn&rsquo;t wired up yet.</p>
        )}
      </footer>
    </form>
  )
}

/* Shared field classes — a muted fixed-width label and a borderless input whose
   row underline highlights on focus (the Gmail compose look). */
const labelClass =
  'w-16 shrink-0 font-display text-[14px] font-semibold uppercase tracking-wide text-muted'
const inputClass =
  'min-w-0 flex-1 bg-transparent text-[16px] text-ink placeholder:text-muted/55 focus:outline-none'

/** Outline envelope; inherits color via currentColor (the header sets it to accent). */
function EnvelopeGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M3.5 7 12 13 20.5 7" strokeLinecap="round" />
    </svg>
  )
}

/** Tiny lock marking the recipient as fixed. */
function LockGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className="text-muted" aria-hidden>
      <path d="M12 2a4 4 0 0 0-4 4v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V6a4 4 0 0 0-4-4zm-2 6V6a2 2 0 1 1 4 0v2h-4z" />
    </svg>
  )
}

/** Paper-plane "send" glyph; inherits the button's text color via currentColor. */
function SendGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
      <path d="M2 21l20-9L2 3v7l14 2-14 2v7z" />
    </svg>
  )
}
