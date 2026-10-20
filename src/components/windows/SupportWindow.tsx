'use client'

import { ConversationProvider, useConversation } from '@elevenlabs/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Img } from '@/components/Img'
import { haloLevel, haloScales, smoothHalo } from './callHalo'

/**
 * Talk to Jun's AI double over ElevenLabs' headless client, not their widget:
 * the widget fixed-positions a floating orb to the viewport, which is wrong
 * inside a desktop of windows. The SDK handles mic capture, playback and barge-in.
 * No transcript; it's a phone call.
 *
 * The agent id is public, so it ships as NEXT_PUBLIC_ELEVENLABS_AGENT_ID. When
 * unset, the window falls back to the photo and says so. The agent itself is
 * provisioned by scripts/provision-agent.mjs (see kb/agent/).
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
  // CallPanel is a child so its hooks are never called conditionally.
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

  // End the call on unmount so the socket and mic don't outlive the window.
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
      // Ask first so a refusal gives a clear message instead of a silent socket.
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

  // Breathing halo: driven from output volume each frame via refs, not state, to
  // avoid 60 re-renders/s. Reduced-motion users get a static wash instead.
  const innerRef = useRef<HTMLSpanElement>(null)
  const outerRef = useRef<HTMLSpanElement>(null)
  const levelRef = useRef(0)
  const volumeRef = useRef(getOutputVolume)
  volumeRef.current = getOutputVolume
  const breathing = connected && isSpeaking
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const paint = (level: number) => {
      const { inner, outer } = haloScales(level)
      if (innerRef.current) {
        innerRef.current.style.transform = `scale(${inner})`
        innerRef.current.style.opacity = String(Math.min(1, 0.25 + level))
      }
      if (outerRef.current) {
        outerRef.current.style.transform = `scale(${outer})`
        outerRef.current.style.opacity = String(0.8 * level)
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
      {/* Halo around the photo shows when Jun is talking; vertical margin leaves room for the outer wash at full swell. */}
      <div className="relative my-4 flex-none">
        <span
          ref={outerRef}
          aria-hidden
          className="pointer-events-none absolute -inset-2 rounded-full bg-accent/15 opacity-0 will-change-transform"
        />
        <span
          ref={innerRef}
          aria-hidden
          className={`pointer-events-none absolute -inset-2 rounded-full bg-accent/30 opacity-0 will-change-transform ${
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

      {/* `relative` stacks text above the halo. Layout is fixed across call states
          (fixed-height slot, `invisible` footnote) so the centred photo never shifts. */}
      <div className="relative space-y-1">
        <h1 className="font-body text-title font-bold">Talk to AI Jun</h1>
        {/* In a call the status replaces the pitch in the same slot. */}
        <div className="flex h-11 items-center justify-center">
          {inCall ? (
            <p className="flex items-center justify-center gap-2 text-ui font-bold text-ink">
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
            <p className="text-ui leading-snug text-muted">
              Ask my AI double about my experience, the projects I&apos;m building, or the research
              — or leave a message for me.
            </p>
          )}
        </div>
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

      {/* Always rendered: its height is part of the fixed layout. */}
      <p className="min-h-5 max-w-xs text-sm text-accent-3" role="alert">
        {error}
      </p>

      <p
        className={`max-w-xs text-xs leading-snug text-muted ${inCall ? 'invisible' : ''}`}
        aria-hidden={inCall}
      >
        You&apos;re talking to an AI built from what&apos;s written on this site; it won&apos;t
        invent anything, and I see a summary afterwards.
      </p>
    </div>
  )
}

/** Round 52px icon button with a label underneath; only the fill varies by variant. */
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
