/**
 * Shared desktop constants.
 *
 * MENUBAR_HEIGHT defines the desktop "work area": a maximized window fills the
 * area below the menu bar down to the bottom of the screen, and desktop icons /
 * windows are kept out of the menu-bar strip. (Minimized windows park as icons
 * in the menu bar's top-right tray.)
 */
export const MENUBAR_HEIGHT = 40

/**
 * Smallest a window may get — the floor for BOTH interactive resize and the
 * open-size clamp, so a window never opens (or shrinks) below this even on a
 * tiny viewport.
 */
export const MIN_WINDOW_SIZE = { width: 360, height: 280 }

/**
 * localStorage key for persisted desktop-icon positions (shared by Desktop + MenuBar).
 * Versioned: bump the suffix whenever the DEFAULT layout changes (launcher order,
 * column wrapping), otherwise returning visitors keep seeing their cached old
 * layout — saved positions overlay the defaults. v2: launchers reordered
 * (About → Call Me → Thoughts → …) and the column wraps on short viewports.
 */
export const ICON_POSITIONS_KEY = 'junos:icon-positions:v2'

/** Custom DOM event that asks the desktop to reset its icon layout (no reload). */
export const RESET_ICONS_EVENT = 'junos:reset-icons'
