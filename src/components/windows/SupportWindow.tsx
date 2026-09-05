'use client'

import Script from 'next/script'
import { createElement } from 'react'
import { Img } from '@/components/Img'
import { WindowHeader } from './ui/WindowHeader'

/**
 * "Call Me" app — talk to Jun's AI double.
 *
 * The conversation itself is an ElevenLabs Conversational AI agent, embedded
 * with their web component: a script that defines <elevenlabs-convai>, plus the
 * element carrying the agent id. The agent's prompt, knowledge base and
 * data-collection fields are configured in the ElevenLabs dashboard — see
 * kb/agent/system-prompt.md (the "ElevenLabs setup" section) for exactly what to
 * switch on and which kb/ files to upload.
 *
 * The agent id is public by design (it only identifies which agent to call, and
 * the agent must be set to public in the dashboard), so it ships as a
 * NEXT_PUBLIC_ env var rather than going through a server route. When it isn't
 * set — a fresh clone, a preview deploy without the var — the window degrades to
 * the photo + intro and says so, instead of rendering a dead widget.
 *
 * `createElement` rather than JSX for the custom element: <elevenlabs-convai> is
 * not in React's intrinsic-element table, and this avoids a global JSX
 * declaration-merge just to name one third-party tag.
 *
 * The widget fixed-positions itself to the viewport (bottom-right, per the
 * agent's dashboard `widget.placement`) — there is no inline embed mode — so it
 * floats over the desktop rather than filling this window. Mounting it HERE
 * rather than at the desktop root is deliberate: the orb then appears when the
 * visitor opens Call Me and disappears when they close it, instead of hovering
 * over every other app.
 */
const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID

export function SupportWindow() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 py-1 text-center">
      <Img
        src="/icons/jun_photo.webp"
        alt="Jun"
        draggable={false}
        className="h-56 w-56 rounded-full object-cover shadow-soft"
      />

      <WindowHeader
        title="Talk to AI Jun"
        subtitle="You can talk to my AI digital double to learn more about Jun's experience, development projects, or research interests, and also anything else you'd like to let Jun know."
      />

      {AGENT_ID ? (
        <>
          <Script
            src="https://unpkg.com/@elevenlabs/convai-widget-embed"
            strategy="lazyOnload"
            async
            type="text/javascript"
          />
          {createElement('elevenlabs-convai', { 'agent-id': AGENT_ID })}
          <p className="text-sm text-muted">
            The call control is the orb in the bottom-right corner of the screen — the widget
            floats above the desktop rather than sitting in this window. Close this window to
            dismiss it.
          </p>
          <p className="text-sm text-muted">
            You&apos;re talking to an AI built from what&apos;s written on this site; it
            won&apos;t invent anything, and Jun sees a summary afterwards.
          </p>
        </>
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
