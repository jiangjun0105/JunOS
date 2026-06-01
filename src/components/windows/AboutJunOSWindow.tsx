/**
 * The "About JunOS" window — what this site/OS actually is. Same layout language
 * as the "About me" window (heading + intro paragraphs + accent tag chips), but
 * focused on the website itself rather than a personal introduction.
 */
export function AboutJunOSWindow() {
  return (
    <div className="space-y-3">
      <h1 className="font-body text-[22px] font-bold">JunOS</h1>
      <p className="text-[18px] text-muted">
        JunOS is a cozy little desktop that lives entirely in a browser tab. Every window here is
        real — drag the title bar to move it, pull the bottom-right corner to resize, and minimize it
        to the tray in the top-right.
      </p>
      <p className="text-[18px]">
        It&apos;s a love letter to the desktops we grew up with, dressed in a warm, hand-drawn theme.
        No heavy UI frameworks — just React, a tiny hand-rolled window manager, and a lot of care for
        the small details.
      </p>
      <p className="text-[18px]">
        Wander through the apps to read articles, browse files, or peek at projects. Every window is
        deep-linkable, so you can share exactly what you&apos;re looking at just by copying the address bar.
      </p>
      <div className="flex flex-wrap gap-2 pt-1">
        <span className="rounded-[6px] border border-line bg-accent/10 px-3 py-1 text-sm text-ink">
          🪟 window manager
        </span>
        <span className="rounded-[6px] border border-line bg-accent-2/10 px-3 py-1 text-sm text-ink">
          ⚛️ next.js
        </span>
        <span className="rounded-[6px] border border-line bg-accent-3/15 px-3 py-1 text-sm text-ink">
          🎬 framer motion
        </span>
        <span className="rounded-[6px] border border-line bg-accent/10 px-3 py-1 text-sm text-ink">
          🎨 cozy theme
        </span>
        <span className="rounded-[6px] border border-line bg-accent-2/10 px-3 py-1 text-sm text-ink">
          🔗 deep-linkable
        </span>
      </div>
    </div>
  )
}
