'use client'

import { ConversationProvider, useConversation } from '@elevenlabs/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Img } from '@/components/Img'
import { haloLevel, haloScales, smoothHalo } from './callHalo'

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
  const { status, isSpeaking, isMuted, setMuted, startSession, endSession, getOutputVolume } =
    conversation

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

  // The breathing halo. Driven straight from the SDK's output volume on every
  // animation frame — written to the DOM through refs, NOT React state, so the
  // window doesn't re-render 60× a second. Only runs while Jun is talking; the
  // moment he stops, the level eases to 0 and the loop ends. Under
  // prefers-reduced-motion the halo stays a static ring instead (below).
  const ringRef = useRef<HTMLSpanElement>(null)
  const glowRef = useRef<HTMLSpanElement>(null)
  const levelRef = useRef(0)
  const volumeRef = useRef(getOutputVolume)
  volumeRef.current = getOutputVolume
  const breathing = connected && isSpeaking
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const paint = (level: number) => {
      const { ring, glow } = haloScales(level)
      if (ringRef.current) {
        ringRef.current.style.transform = `scale(${ring})`
        ringRef.current.style.opacity = String(Math.min(1, 0.35 + level))
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `scale(${glow})`
        glowRef.current.style.opacity = String(0.7 * level)
      }
    }
    const tick = () => {
      const target = breathing ? haloLevel(volumeRef.current()) : 0
      levelRef.current = smoothHalo(levelRef.current, target)
      paint(levelRef.current)
      // Keep going while talking, or until a fading halo has settled.
      if (breathing || levelRef.current > 0) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [breathing])

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 text-center">
      {/* The photo carries the call state: a quiet outline at rest, and while
          Jun is talking a halo that breathes with his voice — a crisp accent
          ring that swells a little and a soft wash behind it that swells a lot.
          Cheaper to read at a glance than text. The two layers sit a few px
          outside the photo and are scaled from their centre by the frame loop
          above; `motion-reduce:` gives reduced-motion users a plain ring. The
          vertical margin is the room the glow needs at full swell, so it never
          washes over the heading below. */}
      <div className="relative my-4 flex-none">
        <span
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute -inset-2 rounded-full bg-accent/30 opacity-0 will-change-transform"
        />
        <span
          ref={ringRef}
          aria-hidden
          className={`pointer-events-none absolute -inset-2 rounded-full border-[3px] border-accent opacity-0 will-change-transform ${
            breathing ? 'motion-reduce:opacity-100' : ''
          }`}
        />
        <Img
          src="/icons/jun_photo.webp"
          alt="Jun"
          draggable={false}
          className="relative h-52 w-52 rounded-full object-cover shadow-soft ring-1 ring-line ring-offset-2 ring-offset-surface"
        />
      </div>

      {/* `relative` so the text stacks above the (absolutely positioned) halo. */}
      <div className="relative space-y-1">
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
