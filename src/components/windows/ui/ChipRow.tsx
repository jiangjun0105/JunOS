/** Wrapping row of accent chips; the three accent skins cycle by index. */
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
