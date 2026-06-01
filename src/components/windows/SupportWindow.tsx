import { WindowHeader } from './ui/WindowHeader'

/**
 * "Call Me" app — a contact card for talking to AI Jun: a round photo above a
 * short intro and a call button.
 *
 * The call itself isn't wired up yet — the button is a placeholder. To make it
 * real, drop a handler on it (e.g. a `tel:` link, a dialer, or a callback form).
 * The photo is /icons/jun_photo.webp.
 */
export function SupportWindow() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 py-1 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/jun_photo.webp"
        alt="Jun"
        draggable={false}
        className="h-64 w-64 rounded-full object-cover shadow-soft"
      />

      <WindowHeader
        title="Talk to AI Jun"
        subtitle="You can talk to my AI digital double to learn more about Jun's experience, development projects, or research interests, and also anything else you'd like to let Jun know."
      />

      {/* Placeholder — wire up the phone-call feature here. */}
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-tile border border-ink bg-accent-2 px-5 py-2.5 font-display text-lg font-bold uppercase tracking-wide text-surface shadow-soft transition-transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <PhoneIcon />
        Call now
      </button>
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
