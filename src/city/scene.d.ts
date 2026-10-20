export interface City {
  focus(appId: string, shift: number): void
  release(): void
  home(): void
  setShift(px: number): void
  dispose(): void
}

export function createCity(
  root: HTMLElement,
  on: { open(id: string): void; hover(id: string | null): void; status(text: string): void },
): City
