/**
 * A flex-wrap row of accent "tag chips" — the little rounded labels at the foot
 * of the About windows ("🌳 nature", "🪟 window manager", …).
 *
 * Both About windows hand-wrote these chips and cycled the three accent skins by
 * hand: chip 0 → accent, 1 → accent-2, 2 → accent-3, then wrap. We reproduce that
 * exact cycle here by index (`i % 3`), mapping to the `.os-chip-1/-2/-3` skins so
 * the colors (and their /10, /10, /15 opacities) match the originals precisely.
 * The chip SHAPE + the cycling logic now live in one place; each window just
 * passes its list of emoji+label strings.
 */

/** The three accent skins, in cycle order — index 0,1,2 then repeat. */
const CHIP_VARIANTS = ['os-chip-1', 'os-chip-2', 'os-chip-3'] as const

export function ChipRow({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {items.map((item, i) => (
        <span key={item} className={`os-chip ${CHIP_VARIANTS[i % CHIP_VARIANTS.length]}`}>
          {item}
        </span>
      ))}
    </div>
  )
}
