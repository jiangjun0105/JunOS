'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { appList, apps } from './apps'
import { MENUBAR_HEIGHT } from './constants'
import { useWindows } from './WindowManager'

/** localStorage key the desktop uses to persist dragged icon positions. */
const ICON_POSITIONS_KEY = 'cozy-os:icon-positions'

type MenuId = 'cozy-os' | 'apps' | 'view'

/**
 * The top menu bar — a hand-rolled menu system (no Radix / headless deps).
 *
 *  - One `openMenu` piece of state tracks which dropdown (if any) is showing.
 *  - Clicking a trigger toggles its menu; clicking another trigger swaps to it.
 *  - A document `mousedown` outside the whole bar closes any open menu, and
 *    Escape does the same. Selecting an item runs its action and closes too.
 *
 * Minimized windows appear as small icons in the top-right tray (macOS-style);
 * clicking one restores it. Every menu item is wired to a real useWindows() action.
 */
export function MenuBar() {
  const { windows, openApp, minimizeAllWindows, closeAllWindows, restoreWindow } = useWindows()
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  const hasWindows = windows.length > 0
  const minimized = windows.filter((w) => w.minimized)

  // Outside-click + Escape both close whatever menu is open.
  useEffect(() => {
    if (!openMenu) return

    function onPointerDown(event: MouseEvent) {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenMenu(null)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openMenu])

  /** Toggle a menu open/closed; opening one while another is open just swaps. */
  function toggleMenu(menu: MenuId) {
    setOpenMenu((current) => (current === menu ? null : menu))
  }

  /** Run an item action, then collapse the menu. */
  function run(action: () => void) {
    action()
    setOpenMenu(null)
  }

  /** View → Reset icon positions: drop the saved layout and reload. */
  function resetIconPositions() {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.removeItem(ICON_POSITIONS_KEY)
    } catch {
      /* ignore quota / private-mode errors */
    }
    window.location.reload()
  }

  return (
    <div ref={barRef} className="os-menubar relative z-30" style={{ height: MENUBAR_HEIGHT }}>
      {/* Brand mark */}
      <span className="os-menubar-brand">
        <span aria-hidden className="h-3 w-3 rounded-sm bg-accent" />
        cozy-os
      </span>

      <MenuTrigger
        label="cozy-os"
        isOpen={openMenu === 'cozy-os'}
        onToggle={() => toggleMenu('cozy-os')}
      >
        <MenuItem onSelect={() => run(() => openApp('about'))}>About</MenuItem>
        <MenuSeparator />
        <MenuItem disabled={!hasWindows} onSelect={() => run(minimizeAllWindows)}>
          Minimize all
        </MenuItem>
        <MenuItem disabled={!hasWindows} onSelect={() => run(closeAllWindows)}>
          Close all windows
        </MenuItem>
      </MenuTrigger>

      <MenuTrigger label="Apps" isOpen={openMenu === 'apps'} onToggle={() => toggleMenu('apps')}>
        {appList.map((app) => (
          <MenuItem key={app.id} onSelect={() => run(() => openApp(app.id))}>
            <span className="flex items-center gap-2">
              <span aria-hidden className="text-base leading-none">
                {app.icon}
              </span>
              {app.title}
            </span>
          </MenuItem>
        ))}
      </MenuTrigger>

      <MenuTrigger label="View" isOpen={openMenu === 'view'} onToggle={() => toggleMenu('view')}>
        <MenuItem onSelect={() => run(resetIconPositions)}>Reset icon positions</MenuItem>
        <MenuItem disabled>Theme: Totoro</MenuItem>
      </MenuTrigger>

      {/* Minimized windows: small icons in the top-right tray (macOS-style); click to restore. */}
      {minimized.length > 0 && (
        <div className="ml-auto flex items-center gap-1.5 pl-2">
          {minimized.map((win) => (
            <button
              key={win.id}
              type="button"
              title={`Restore ${win.title}`}
              aria-label={`Restore ${win.title}`}
              onClick={() => restoreWindow(win.id)}
              className="os-tray-item"
            >
              <span aria-hidden>{apps[win.appId]?.icon}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface MenuTriggerProps {
  label: string
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
}

/** A clickable label that reveals its dropdown panel directly beneath it. */
function MenuTrigger({ label, isOpen, onToggle, children }: MenuTriggerProps) {
  return (
    <div className="relative">
      <button type="button" onClick={onToggle} data-open={isOpen} className="os-menubar-trigger">
        {label}
      </button>

      {isOpen && (
        <div role="menu" className="os-menu-panel">
          {children}
        </div>
      )}
    </div>
  )
}

interface MenuItemProps {
  children: ReactNode
  onSelect?: () => void
  disabled?: boolean
}

/** A single dropdown row — a button so it's keyboard-focusable and clickable. */
function MenuItem({ children, onSelect, disabled = false }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onSelect}
      className="os-menu-item"
    >
      {children}
    </button>
  )
}

/** A thin divider between groups of items. */
function MenuSeparator() {
  return <div role="separator" className="os-menu-separator" />
}
