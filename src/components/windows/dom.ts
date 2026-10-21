export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/** A CSS custom property on :root, trimmed (e.g. `cssVar('--cyan')`). */
export const cssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim()
