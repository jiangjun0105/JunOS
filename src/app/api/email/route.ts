import { NextResponse } from 'next/server'
import { Resend } from 'resend'

/**
 * POST /api/email — delivers a message from the Email app to Jun's inbox.
 *
 * The recipient is fixed (Jun); the visitor supplies their own address, which
 * becomes the Reply-To so a reply in Gmail goes straight back to them. The
 * From must be at a Resend-verified domain — junbot.dev (apex) is verified.
 *
 * The RESEND_API_KEY comes from the environment: locally via .env, in
 * production via the Vercel ↔ Resend Marketplace integration.
 */

/** Fixed recipient — every message from this app goes here. */
const RECIPIENT = 'jiangjun0105@gmail.com'
/** Verified sender. Local part is arbitrary; the domain must be Resend-verified. */
const FROM = 'JunOS <contact@junbot.dev>'

/** Loose check — rejects obvious non-emails without trying to fully parse RFC 5322. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** Caps so a bot can't post a novel; comfortably above any real compose. */
const LIMITS = { from: 254, subject: 200, body: 5000 }

export async function POST(req: Request) {
  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { from, subject, body, company } = (payload ?? {}) as Record<string, unknown>

  // Honeypot: humans never fill the hidden `company` field. Feign success so a
  // bot doesn't learn it was filtered.
  if (typeof company === 'string' && company.trim() !== '') {
    return NextResponse.json({ ok: true })
  }

  // Validate + normalize the real fields.
  const f = typeof from === 'string' ? from.trim() : ''
  const s = typeof subject === 'string' ? subject.trim() : ''
  const b = typeof body === 'string' ? body.trim() : ''

  if (!EMAIL_RE.test(f) || f.length > LIMITS.from) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }
  if (!s || s.length > LIMITS.subject) {
    return NextResponse.json({ error: 'A subject is required.' }, { status: 400 })
  }
  if (!b || b.length > LIMITS.body) {
    return NextResponse.json({ error: 'A message is required.' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // Server misconfiguration, not the visitor's fault.
    console.error('[api/email] RESEND_API_KEY is not set')
    return NextResponse.json({ error: 'Email is not configured on the server.' }, { status: 500 })
  }

  const resend = new Resend(apiKey)
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: RECIPIENT,
      replyTo: f, // a reply in Gmail goes back to the visitor
      subject: s,
      text: `From: ${f}\n\n${b}`,
    })
    if (error) {
      console.error('[api/email] resend error:', error)
      return NextResponse.json({ error: 'Could not send right now. Please try again.' }, { status: 502 })
    }
    return NextResponse.json({ ok: true, id: data?.id })
  } catch (err) {
    console.error('[api/email] send threw:', err)
    return NextResponse.json({ error: 'Could not send right now. Please try again.' }, { status: 502 })
  }
}
