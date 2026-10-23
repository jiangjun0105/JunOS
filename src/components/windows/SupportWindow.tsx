'use client'

import { ConversationProvider, useConversation } from '@elevenlabs/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cssVar, prefersReducedMotion } from './dom'
import { voiceLevel, smoothLevel } from './voiceLevel'
import {
  drawBars,
  drawTwin,
  loadTwin,
  type Levels,
  type Palette,
  type Phase,
  type Twin,
} from './hologram'

/**
 * Talk to Jun's AI double over ElevenLabs' headless client, not their widget:
 * the widget fixed-positions a floating orb to the viewport, which is wrong
 * inside a desktop of windows. The SDK handles mic capture, playback and barge-in.
 * No transcript; it's a phone call.
 *
 * The agent id is public, so it ships as NEXT_PUBLIC_ELEVENLABS_AGENT_ID. When
 * unset, the window shows the twin idle and says so. The agent itself is
 * provisioned by scripts/provision-agent.mjs (see kb/agent/).
 */
const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID
const CUTOUT = '/media/jun-cutout.png'
const SILENT: Levels = { ai: 0, you: 0 }
const pad = (n: number) => String(Math.floor(n)).padStart(2, '0')
const STATUS: Record<Phase, string> = {
  idle: 'Ready',
  connecting: 'Connecting…',
  speaking: 'AI Jun is talking',
  listening: 'Listening',
}

export function SupportWindow() {
  if (!AGENT_ID) {
    return (
      <CallScreen phase="idle" read={() => SILENT} startedAt={null}>
        <p className="call-fine">
          The voice agent isn&apos;t configured on this deployment yet. Set{' '}
          <code>NEXT_PUBLIC_ELEVENLABS_AGENT_ID</code> to the ElevenLabs agent id to enable it.
        </p>
      </CallScreen>
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
  const [startedAt, setStartedAt] = useState<number | null>(null)

  const conversation = useConversation({
    onError: (message) => setError(message),
    onConnect: () => {
      setError(null)
      setStartedAt(performance.now())
    },
    onDisconnect: () => setStartedAt(null),
  })
  const {
    status,
    isSpeaking,
    isMuted,
    setMuted,
    startSession,
    endSession,
    getOutputVolume,
    getInputVolume,
  } = conversation

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
  const phase: Phase =
    status === 'connecting'
      ? 'connecting'
      : connected
        ? isSpeaking
          ? 'speaking'
          : 'listening'
        : 'idle'
  // read by the animation loop each frame (via a ref in CallScreen), so the levels never re-render React
  const read = (): Levels =>
    connected
      ? {
          ai: voiceLevel(getOutputVolume()),
          you: isMuted ? 0 : voiceLevel(getInputVolume()),
        }
      : SILENT

  return (
    <CallScreen phase={phase} read={read} startedAt={startedAt}>
      <div className="call-keys">
        {phase === 'idle' ? (
          <button type="button" className="call-key" data-k="call" onClick={call}>
            <PhoneIcon />
            Call AI Jun
          </button>
        ) : (
          <>
            <button
              type="button"
              className="call-key"
              data-k="mute"
              aria-pressed={isMuted}
              disabled={!connected}
              onClick={() => setMuted(!isMuted)}
            >
              {isMuted ? <MicOffIcon /> : <MicIcon />}
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <button type="button" className="call-key" data-k="end" onClick={endSession}>
              <PhoneIcon rotate={135} />
              End
            </button>
          </>
        )}
      </div>
      <p className="call-error" role="alert">
        {error}
      </p>
      <p className="call-fine">
        An AI built from what&apos;s written on this site. It won&apos;t invent anything, and I see
        a summary afterwards.
      </p>
    </CallScreen>
  )
}

/**
 * The layout: the twin on its projector on the left, the console on the right (stacked
 * when narrow). One rAF loop draws the twin, both volume bars and the call timer
 * straight onto canvases and a span, so 60 fps never touches React state.
 */
function CallScreen({
  phase,
  read,
  startedAt,
  children,
}: {
  phase: Phase
  read: () => Levels
  startedAt: number | null
  children: ReactNode
}) {
  const twinRef = useRef<HTMLCanvasElement>(null)
  const aiRef = useRef<HTMLCanvasElement>(null)
  const youRef = useRef<HTMLCanvasElement>(null)
  const timerRef = useRef<HTMLSpanElement>(null)
  const live = useRef({ phase, read, startedAt })
  live.current = { phase, read, startedAt }

  useEffect(() => {
    let dead = false
    let twin: Twin | null = null
    loadTwin(CUTOUT).then(
      (t) => {
        if (!dead) twin = t
      },
      () => {}, // no cutout: the projector still runs, just empty
    )
    const pal: Palette = {
      cyan: cssVar('--cyan'),
      amber: cssVar('--accent'),
      green: cssVar('--accent-2'),
      font: cssVar('--font-mono') || 'monospace',
    }
    const still = prefersReducedMotion()
    const lv = { ai: 0, you: 0 }
    const hist = { ai: [] as number[], you: [] as number[] }
    let sampled = performance.now()
    let frame = 0
    let shown = ''
    const tick = () => {
      const now = performance.now()
      const { phase, read, startedAt } = live.current
      const raw = read()
      lv.ai = smoothLevel(lv.ai, raw.ai)
      lv.you = smoothLevel(lv.you, raw.you)
      // one bar per 50 ms even when frames are slow; after a hidden tab, skip ahead instead of replaying
      sampled = Math.max(sampled, now - 6000)
      for (; sampled < now; sampled += 50)
        for (const k of ['ai', 'you'] as const) {
          hist[k].push(lv[k])
          if (hist[k].length > 200) hist[k].shift()
        }
      if (twinRef.current)
        drawTwin(twinRef.current, twin, still ? 0 : now / 1000, lv, phase, pal, still)
      if (aiRef.current) drawBars(aiRef.current, hist.ai, pal.amber)
      if (youRef.current) drawBars(youRef.current, hist.you, pal.green)
      const s = startedAt === null ? -1 : Math.floor((now - startedAt) / 1000)
      const clock = s < 0 ? '--:--' : `${pad(s / 60)}:${pad(s % 60)}`
      if (timerRef.current && clock !== shown) timerRef.current.textContent = shown = clock
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      dead = true
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="call" data-phase={phase}>
      <div className="call-in">
        <div className="call-twin">
          <canvas ref={twinRef} aria-hidden="true" />
        </div>
        <div className="call-console">
          <div>
            <div className="call-k">Digital twin · v1 · built from this site</div>
            <h1 className="call-title">Talk to AI Jun</h1>
            <p className="call-pitch">
              Ask my digital twin about my work, the projects I&apos;m building, or the research —
              or leave me a message.
            </p>
          </div>
          <div className="call-chan">
            AI JUN
            <canvas ref={aiRef} aria-hidden="true" />
          </div>
          <div className="call-chan">
            YOU
            <canvas ref={youRef} aria-hidden="true" />
          </div>
          <div className="call-statusrow">
            <span className="call-status" data-phase={phase} aria-live="polite">
              <span className="call-dot" aria-hidden="true" />
              {STATUS[phase]}
            </span>
            <span ref={timerRef} className="call-timer">
              --:--
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

/** Phone receiver, off the hook — start the call; rotated 135° it is the universal "hang up". */
function PhoneIcon({ rotate = 0 }: { rotate?: number }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path
        transform={`rotate(${rotate} 12 12)`}
        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
      />
    </svg>
  )
}

function MicIcon({ children }: { children?: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
      <path d="M18 11a1 1 0 1 0-2 0 4 4 0 0 1-8 0 1 1 0 1 0-2 0 6 6 0 0 0 5 5.92V19H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.08A6 6 0 0 0 18 11z" />
      {children}
    </svg>
  )
}

/** Mic with a slash — muted. */
function MicOffIcon() {
  return (
    <MicIcon>
      <path
        d="M4 3.5 20.5 20"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </MicIcon>
  )
}
