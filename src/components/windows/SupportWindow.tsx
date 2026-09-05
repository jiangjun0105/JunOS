'use client'

import { ConversationProvider, useConversation } from '@elevenlabs/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Img } from '@/components/Img'

/**
 * "Call Me" app — talk to Jun's AI double, in this window.
 *
 * The call runs over the ElevenLabs Conversational AI WebSocket
 * (wss://api.elevenlabs.io/v1/convai/conversation) via their headless client,
 * NOT their embeddable widget: the widget fixed-positions a floating orb to the
 * viewport and owns its own look, which is wrong inside a desktop made of
 * windows. Driving the connection ourselves means the controls are plain JunOS
 * components.
 *
 * The SDK is doing the parts that are genuinely hard and easy to get subtly
 * wrong: mic capture and 16 kHz PCM framing, playback scheduling, and barge-in
 * (cutting the agent off the moment the visitor speaks).
 *
 * No transcript: it's a phone call. Reading along would pull attention out of
 * the conversation, and the visitor already heard it.
 *
 * The agent's prompt, knowledge base and post-call analysis are provisioned from
 * the knowledge base by scripts/provision-agent.mjs — see kb/agent/.
 *
 * The agent id is public by design (it only names which public agent to call),
 * so it ships as a NEXT_PUBLIC_ env var. Unset — a fresh clone, a preview deploy
 * without the var — the window degrades to the photo and says so rather than
 * rendering a dead button.
 */
const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID

export function SupportWindow() {
  if (!AGENT_ID) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 text-center">
        <Img
          src="/icons/jun_photo.webp"
          alt="Jun"
          draggable={false}
          className="h-48 w-48 rounded-full object-cover shadow-soft"
        />
        <p className="text-sm text-muted">
          The voice agent isn&apos;t configured on this deployment yet.
        </p>
        <p className="text-xs text-muted">
          Set <code className="font-mono">NEXT_PUBLIC_ELEVENLABS_AGENT_ID</code> to the ElevenLabs
          agent id to enable it.
        </p>
      </div>
    )
  }
  // The provider owns the connection; CallPanel is a child so its hooks are
  // never called conditionally. The photo and heading live inside it too —
  // they change with the call state, so they can't sit outside the provider.
  return (
    <ConversationProvider>
      <CallPanel agentId={AGENT_ID} />
    </ConversationProvider>
  )
}

function CallPanel({ agentId }: { agentId: string }) {
  const [error, setError] = useState<string | null>(null)

  const conversation = useConversation({
    onError: (message) => setError(message),
    onConnect: () => setError(null),
  })
  const { status, isSpeaking, isMuted, setMuted, startSession, endSession } = conversation

  // End the call if the window is closed mid-conversation — otherwise the
  // socket (and the microphone) would outlive the UI that owns them.
  const endRef = useRef(endSession)
  endRef.current = endSession
  const statusRef = useRef(status)
  statusRef.current = status
  useEffect(
    () => () => {
      if (statusRef.current !== 'disconnected') endRef.current()
    },
    [],
  )

  async function call() {
    setError(null)
    try {
      // Ask before connecting, so a refusal is a clear message here rather than
      // a socket that opens and then hears nothing.
      await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError('I need microphone access to take the call — allow it and try again.')
      return
    }
    startSession({ agentId, connectionType: 'websocket' })
  }

  const connected = status === 'connected'
  const connecting = status === 'connecting'
  const inCall = connected || connecting

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 text-center">
      {/* The photo carries the call state: a quiet outline at rest, an accent
          ring while Jun is talking. Cheaper to read at a glance than text. */}
      <Img
        src="/icons/jun_photo.webp"
        alt="Jun"
        draggable={false}
        className={`h-52 w-52 flex-none rounded-full object-cover shadow-soft ring-offset-2 ring-offset-surface transition-all ${
          connected && isSpeaking ? 'ring-4 ring-accent' : 'ring-1 ring-line'
        }`}
      />

      <div className="space-y-1">
        <h1 className="font-body text-[22px] font-bold">Talk to AI Jun</h1>
        {/* In a call the pitch is over — the status takes its place, so the
            controls sit right under the photo instead of below a paragraph
            nobody is reading mid-conversation. */}
        {inCall ? (
          <p className="flex h-6 items-center justify-center gap-2 text-[15px] font-bold text-ink">
            {connecting ? (
              <span className="text-muted">Connecting…</span>
            ) : (
              <>
                <span
                  className={`inline-block h-2 w-2 rounded-full ${isSpeaking ? 'bg-accent' : 'bg-accent-2'}`}
                  aria-hidden
                />
                {isSpeaking ? 'Jun is talking' : 'Listening'}
              </>
            )}
          </p>
        ) : (
          <p className="text-[15px] leading-snug text-muted">
            Ask my AI double about my experience, the projects I&apos;m building, or the research
            — or leave a message for me.
          </p>
        )}
      </div>

      <div className="flex items-start justify-center gap-4">
        {connected ? (
          <>
            <CallKey
              label={isMuted ? 'Unmute' : 'Mute'}
              variant={isMuted ? 'active' : 'neutral'}
              onClick={() => setMuted(!isMuted)}
              pressed={isMuted}
            >
              {isMuted ? <MicOffIcon /> : <MicIcon />}
            </CallKey>
            <CallKey label="End call" variant="end" onClick={endSession}>
              <PhoneDownIcon />
            </CallKey>
          </>
        ) : (
          <CallKey
            label={connecting ? 'Calling…' : 'Call now'}
            variant="call"
            onClick={call}
            disabled={connecting}
          >
            <PhoneIcon />
          </CallKey>
        )}
      </div>

      {error && <p className="max-w-xs text-sm text-accent-3">{error}</p>}

      {!inCall && (
        <p className="max-w-xs text-xs leading-snug text-muted">
          You&apos;re talking to an AI built from what&apos;s written on this site; it won&apos;t
          invent anything, and I see a summary afterwards.
        </p>
      )}
    </div>
  )
}

/**
 * One key on the dialer: a round icon button with its label underneath. Every
 * key is the same 52px circle whatever it does — only the fill changes — so the
 * row reads as a set of controls rather than a hierarchy.
 */
function CallKey({
  label,
  variant,
  onClick,
  disabled,
  pressed,
  children,
}: {
  label: string
  variant: 'call' | 'end' | 'neutral' | 'active'
  onClick: () => void
  disabled?: boolean
  pressed?: boolean
  children: ReactNode
}) {
  const fill = {
    call: 'bg-accent-2 text-surface',
    end: 'bg-accent-3 text-surface',
    neutral: 'bg-surface text-ink',
    active: 'bg-ink text-surface',
  }[variant]

  return (
    <div className="flex w-[72px] flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        aria-pressed={pressed}
        className={`grid h-[52px] w-[52px] place-items-center rounded-full border border-ink shadow-soft transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:translate-y-0 disabled:opacity-60 ${fill}`}
      >
        {children}
      </button>
      <span className="font-body text-xs font-bold text-muted">{label}</span>
    </div>
  )
}

/** Phone receiver, off the hook — start the call. */
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden fill="currentColor">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  )
}

/** The same receiver rotated 135° — the universal "hang up". */
function PhoneDownIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden fill="currentColor">
      <g transform="rotate(135 12 12)">
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
      </g>
    </svg>
  )
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden fill="currentColor">
      <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
      <path d="M18 11a1 1 0 1 0-2 0 4 4 0 0 1-8 0 1 1 0 1 0-2 0 6 6 0 0 0 5 5.92V19H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.08A6 6 0 0 0 18 11z" />
    </svg>
  )
}

/** Mic with a slash — muted. */
function MicOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden fill="currentColor">
      <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
      <path d="M18 11a1 1 0 1 0-2 0 4 4 0 0 1-8 0 1 1 0 1 0-2 0 6 6 0 0 0 5 5.92V19H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.08A6 6 0 0 0 18 11z" />
      <path
        d="M4 3.5 20.5 20"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
