'use client'

import { ConversationProvider, useConversation } from '@elevenlabs/react'
import { useEffect, useRef, useState } from 'react'
import { Img } from '@/components/Img'
import { WindowHeader } from './ui/WindowHeader'

/**
 * "Call Me" app — talk to Jun's AI double, in this window.
 *
 * The call runs over the ElevenLabs Conversational AI WebSocket
 * (wss://api.elevenlabs.io/v1/convai/conversation) via their headless client,
 * NOT their embeddable widget: the widget fixed-positions a floating orb to the
 * viewport and owns its own look, which is wrong inside a desktop made of
 * windows. Driving the connection ourselves means the call button, the status
 * line and the transcript are plain JunOS components.
 *
 * The SDK is doing the parts that are genuinely hard and easy to get subtly
 * wrong: mic capture and 16 kHz PCM framing, playback scheduling, and barge-in
 * (cutting the agent off the moment the visitor speaks).
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
  return (
    <div className="flex min-h-full flex-col items-center gap-4 py-1 text-center">
      <Img
        src="/icons/jun_photo.webp"
        alt="Jun"
        draggable={false}
        className="h-40 w-40 flex-none rounded-full object-cover shadow-soft"
      />

      <WindowHeader
        title="Talk to AI Jun"
        subtitle="You can talk to my AI digital double to learn more about Jun's experience, development projects, or research interests, and also anything else you'd like to let Jun know."
      />

      {AGENT_ID ? (
        // The provider owns the connection; CallPanel is a child so its hooks
        // are never called conditionally.
        <ConversationProvider>
          <CallPanel agentId={AGENT_ID} />
        </ConversationProvider>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted">
            The voice agent isn&apos;t configured on this deployment yet.
          </p>
          <p className="text-xs text-muted">
            Set <code className="font-mono">NEXT_PUBLIC_ELEVENLABS_AGENT_ID</code> to the
            ElevenLabs agent id to enable it.
          </p>
        </div>
      )}
    </div>
  )
}

type Turn = { source: 'user' | 'ai'; message: string }

function CallPanel({ agentId }: { agentId: string }) {
  const [turns, setTurns] = useState<Turn[]>([])
  const [error, setError] = useState<string | null>(null)

  const conversation = useConversation({
    onMessage: ({ message, source }) => setTurns((t) => [...t, { source, message }]),
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

  // Keep the newest turn in view as the transcript grows.
  const logRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [turns])

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
    setTurns([])
    startSession({ agentId, connectionType: 'websocket' })
  }

  const connected = status === 'connected'
  const connecting = status === 'connecting'

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {!connected ? (
        <button
          type="button"
          onClick={call}
          disabled={connecting}
          className="inline-flex items-center gap-2 rounded-tile border border-ink bg-accent-2 px-5 py-2.5 font-display text-lg font-bold uppercase tracking-wide text-surface shadow-soft transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:translate-y-0 disabled:opacity-60"
        >
          <PhoneIcon />
          {connecting ? 'Connecting…' : 'Call now'}
        </button>
      ) : (
        <>
          <p className="flex items-center gap-2 text-sm font-bold text-ink">
            <span
              className={`inline-block h-2 w-2 rounded-full ${isSpeaking ? 'bg-accent' : 'bg-accent-2'}`}
              aria-hidden
            />
            {isSpeaking ? 'Jun is talking' : 'Listening'}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="os-action-btn"
              onClick={() => setMuted(!isMuted)}
              aria-pressed={isMuted}
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <button
              type="button"
              onClick={endSession}
              className="inline-flex items-center gap-2 rounded-tile border border-ink bg-accent-3 px-4 py-2 font-display font-bold uppercase tracking-wide text-surface shadow-soft"
            >
              End call
            </button>
          </div>
        </>
      )}

      {error && <p className="text-sm text-accent-3">{error}</p>}

      {turns.length > 0 && (
        <div
          ref={logRef}
          className="max-h-48 w-full overflow-y-auto rounded-tile border border-line bg-surface-2/50 p-3 text-left"
        >
          {turns.map((turn, i) => (
            <p key={i} className="mb-1.5 text-sm leading-relaxed last:mb-0">
              <span className="font-bold text-muted">
                {turn.source === 'ai' ? 'Jun' : 'You'}:{' '}
              </span>
              <span className="text-ink">{turn.message}</span>
            </p>
          ))}
        </div>
      )}

      {!connected && !connecting && (
        <p className="text-xs text-muted">
          You&apos;re talking to an AI built from what&apos;s written on this site; it won&apos;t
          invent anything, and Jun sees a summary afterwards.
        </p>
      )}
    </div>
  )
}

/** Phone-receiver glyph; inherits the button's text color via currentColor. */
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="currentColor">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  )
}
