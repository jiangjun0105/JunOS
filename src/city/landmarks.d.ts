export interface Landmark {
  id: string
  label: string
  place: string
  at: [number, number]
  /** Metres above the ground the icon anchors at. */
  lift?: number
  desc: string
}

export const APPS: Landmark[]
export const GLYPH: Record<string, string>
export const RETICLE: string
