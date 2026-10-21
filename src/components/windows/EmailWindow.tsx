'use client'

import { useState, type InputHTMLAttributes } from 'react'
import { RECIPIENT_EMAIL } from '@/site'

/** Gmail-style compose form that POSTs to /api/email (Resend; validation and honeypot live in that route). */

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
    (setter: (value: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    <form onSubmit={handleSubmit} className="mail">
      {/* To — fixed recipient, shown as a locked chip (not an input). */}
      <div className="mail-row">
        <span className="mail-k">To</span>
        <span title="Messages from this app always go to Jun" className="mail-to">
          <LockGlyph />
          {RECIPIENT_EMAIL}
        </span>
      </div>

      {/* From — the sender's own address (becomes Reply-To). */}
      <Field
        label="From"
        id="email-from"
        type="email"
        autoComplete="email"
        value={from}
        onChange={onEdit(setFrom)}
        disabled={sending}
        placeholder="you@example.com"
      />

      <Field
        label="Subject"
        id="email-subject"
        type="text"
        value={subject}
        onChange={onEdit(setSubject)}
        disabled={sending}
        placeholder="What's this about?"
      />

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
        placeholder="Write your message. This note goes straight to Jun's inbox. He'll reply to your address."
        className="mail-body"
      />

      {/* Footer: send button + error status. */}
      <footer className="mail-foot">
        <button type="submit" disabled={sending} className="call-key" data-k="send">
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
          <p className="call-error" role="alert">
            ⚠ {error}
          </p>
        )}
      </footer>
    </form>
  )
}

/** A labelled single-line field; the row underline highlights on focus. */
function Field({
  label,
  ...input
}: { label: string; id: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="mail-row">
      <label htmlFor={input.id} className="mail-k">
        {label}
      </label>
      <input required className="mail-in" {...input} />
    </div>
  )
}

/** Success screen shown after a message is delivered. */
function SentConfirmation({ onReset }: { onReset: () => void }) {
  return (
    <div className="mail-sent" role="status">
      <span className="mail-check">
        <CheckGlyph />
      </span>
      <div className="call-k">Transmission complete</div>
      <h1 className="call-title">Message sent</h1>
      <p className="call-pitch">
        Thanks. It&apos;s on its way to Jun, who replies straight to your email.
      </p>
      <button type="button" onClick={onReset} className="call-key" data-k="send">
        Write another
      </button>
    </div>
  )
}

/** Tiny lock marking the recipient as fixed. */
function LockGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden>
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
    <svg
      viewBox="0 0 24 24"
      width="30"
      height="30"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}
