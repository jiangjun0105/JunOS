/**
 * "Support" app — a friendly contact card: a round agent photo with a button to
 * place a phone call below it.
 *
 * The call itself isn't wired up yet — the button is a placeholder. To make it
 * real, drop a handler on it (e.g. a `tel:` link, a dialer, or a callback form).
 * The photo (/icons/support-agent.svg) is a placeholder too; swap in a real
 * headshot when you have one.
 */
export function SupportWindow() {
  return (
    <div className="flex flex-col items-center gap-4 py-1 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/support-agent.svg"
        alt="Support agent"
        draggable={false}
        className="h-32 w-32 rounded-full border-2 border-ink object-cover shadow-soft"
      />

      <div className="space-y-0.5">
        <h1 className="font-body text-[22px] font-bold">Need a hand?</h1>
        <p className="text-[18px] text-muted">Our support team is one tap away.</p>
      </div>

      {/* Placeholder — wire up the phone-call feature here. */}
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-tile border-2 border-ink bg-accent-2 px-5 py-2.5 font-display text-lg font-bold uppercase tracking-wide text-surface shadow-soft transition-transform hover:-translate-y-0.5 active:translate-y-0"
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
