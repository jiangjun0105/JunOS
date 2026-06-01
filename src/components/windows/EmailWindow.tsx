'use client'

import { useState } from 'react'

/**
 * "Email" app — a Gmail-style compose window for writing to Jun.
 *
 * The recipient is FIXED to jiangjun0105@gmail.com: this is a "message Jun"
 * form, not a general mail client. A visitor fills in their own address (which
 * becomes the Reply-To), a subject, and the message body.
 *
 * Submitting POSTs to /api/email, which sends the mail via Resend. See that
 * route for validation, the verified From domain, and the honeypot check.
 */

/** Where every message from this app is addressed. Not user-editable. */
const RECIPIENT = 'jiangjun0105@gmail.com'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function EmailWindow() {
  const [from, setFrom] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [company, setCompany] = useState('') // honeypot — humans leave this empty
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'sending') return // guard against double-submit
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, subject, body, company }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }
      setStatus('sent')
    } catch {
      setError('Network error — check your connection and try again.')
      setStatus('error')
    }
  }

  // Editing after an error clears it so the form feels calm again.
  const onEdit =
    (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(e.target.value)
      if (status === 'error') {
        setStatus('idle')
        setError('')
      }
    }

  if (status === 'sent') {
    return (
      <SentConfirmation
        onReset={() => {
          setFrom('')
          setSubject('')
          setBody('')
          setStatus('idle')
        }}
      />
    )
  }

  const sending = status === 'sending'

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
          <p className="text-[14px] text-muted">Send a note straight to Jun&rsquo;s inbox. Jun replies to your address.</p>
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

      {/* From — the sender's own address (becomes Reply-To). */}
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
          disabled={sending}
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
          disabled={sending}
          placeholder="What&rsquo;s this about?"
          className={inputClass}
        />
      </div>

      {/* Honeypot — off-screen and hidden from AT; only bots fill it. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden opacity-0"
      />

      {/* Message body — grows to fill the window. */}
      <textarea
        id="email-body"
        aria-label="Message"
        required
        value={body}
        onChange={onEdit(setBody)}
        disabled={sending}
        placeholder="Write your message&hellip;"
        className="mt-3 min-h-[150px] w-full flex-1 resize-none rounded-md bg-transparent text-[16px] leading-relaxed text-ink placeholder:text-muted/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
      />

      {/* Footer: send button + error status. */}
      <footer className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line/70 pt-3">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-2 rounded-tile border border-ink bg-accent px-5 py-2 font-display text-[16px] font-bold uppercase tracking-wide text-surface shadow-soft transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {sending ? (
            'Sending…'
          ) : (
            <>
              Send
              <SendGlyph />
            </>
          )}
        </button>

        {status === 'error' && (
          <p className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent-3">
            <span aria-hidden>⚠</span>
            {error}
          </p>
        )}
      </footer>
    </form>
  )
}

/** Success screen shown after a message is delivered. */
function SentConfirmation({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 py-6 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full border border-ink bg-accent-2/15 text-accent-2">
        <CheckGlyph />
      </span>
      <div className="space-y-1">
        <h1 className="font-display text-[22px] font-bold text-ink">Message sent</h1>
        <p className="text-[16px] text-muted">
          Thanks — your note is on its way to Jun. He&rsquo;ll reply straight to your email.
        </p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="rounded-tile border border-ink bg-surface-2 px-4 py-2 font-display text-[15px] font-bold uppercase tracking-wide text-ink shadow-soft transition-transform hover:-translate-y-0.5 active:translate-y-0"
      >
        Write another
      </button>
    </div>
  )
}

/* Shared field classes — a muted fixed-width label and a borderless input whose
   row underline highlights on focus (the Gmail compose look). */
const labelClass =
  'w-16 shrink-0 font-display text-[14px] font-semibold uppercase tracking-wide text-muted'
const inputClass =
  'min-w-0 flex-1 bg-transparent text-[16px] text-ink placeholder:text-muted/55 focus:outline-none disabled:opacity-60'

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

/** Check mark for the success screen. */
function CheckGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}
