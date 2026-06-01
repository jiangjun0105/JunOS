import { ChipRow } from './ui/ChipRow'

/** Placeholder content for the "About me" app. Make it yours! */
export function AboutWindow() {
  return (
    <div className="space-y-3">
      <h1 className="font-body text-[22px] font-bold">Hi, I&apos;m [Your Name]</h1>
      <p className="text-[18px] text-muted">
        Welcome to my little corner of the forest. This is a real, draggable, resizable window —
        grab the title bar to move it, and drag the handle in the bottom-right corner to resize.
      </p>
      <p className="text-[18px]">Replace this with whatever you like: a bio, links, or projects.</p>
      <ChipRow items={['🌳 nature', '🌧️ cozy', '🌰 craft']} />
    </div>
  )
}
