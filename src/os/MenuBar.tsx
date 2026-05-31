'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { appList, apps } from './apps'
import { MENUBAR_HEIGHT, RESET_ICONS_EVENT } from './constants'
import { useWindows } from './WindowManager'

type MenuId = 'cozy-os' | 'apps' | 'view'

/**
 * The top menu bar — a hand-rolled menu system (no Radix / headless deps).
 *
 *  - One `openMenu` piece of state tracks which dropdown (if any) is showing.
 *  - Clicking a trigger toggles its menu; clicking another trigger swaps to it.
 *  - A document `pointerdown` outside the whole bar closes any open menu, and
 *    Escape does the same. Selecting an item runs its action and closes too.
 *  - Keyboard: ArrowDown opens a focused trigger; within an open menu Up/Down/
 *    Home/End move between items and Escape closes + returns focus to the trigger.
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

  // Outside-pointerdown + Escape both close whatever menu is open. (pointerdown,
  // not mousedown, so a touch drag starting beneath the menu also dismisses it.)
  useEffect(() => {
    if (!openMenu) return

    function onPointerDown(event: PointerEvent) {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenMenu(null)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
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

  /** View → Reset icon positions: ask the desktop to restore defaults in place (no reload). */
  function resetIconPositions() {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent(RESET_ICONS_EVENT))
  }

  return (
    <div ref={barRef} className="os-menubar relative z-30" style={{ height: MENUBAR_HEIGHT }}>
      <MenuTrigger
        label={
          <>
            <span aria-hidden className="h-3 w-3 rounded-sm bg-accent" />
            cozy-os
          </>
        }
        isOpen={openMenu === 'cozy-os'}
        onToggle={() => toggleMenu('cozy-os')}
        onClose={() => setOpenMenu(null)}
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

      <MenuTrigger
        label="Apps"
        isOpen={openMenu === 'apps'}
        onToggle={() => toggleMenu('apps')}
        onClose={() => setOpenMenu(null)}
      >
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

      <MenuTrigger
        label="View"
        isOpen={openMenu === 'view'}
        onToggle={() => toggleMenu('view')}
        onClose={() => setOpenMenu(null)}
      >
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
  label: ReactNode
  isOpen: boolean
  onToggle: () => void
  /** Close this menu (used when returning focus to the trigger on Escape). */
  onClose: () => void
  children: ReactNode
}

/**
 * A clickable label that reveals its dropdown panel directly beneath it, with
 * roving keyboard focus inside the panel.
 */
function MenuTrigger({ label, isOpen, onToggle, onClose, children }: MenuTriggerProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // When the menu opens, move focus to its first enabled item.
  useEffect(() => {
    if (!isOpen) return
    const first = panelRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')
    first?.focus()
  }, [isOpen])

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !isOpen) {
            e.preventDefault()
            onToggle()
          }
        }}
        data-open={isOpen}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="os-menubar-trigger"
      >
        {label}
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          role="menu"
          className="os-menu-panel"
          onKeyDown={(e) => {
            const items = Array.from(
              panelRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? []
            )
            if (items.length === 0) return
            const idx = items.indexOf(document.activeElement as HTMLButtonElement)
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              items[(idx + 1) % items.length].focus()
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              items[(idx - 1 + items.length) % items.length].focus()
            } else if (e.key === 'Home') {
              e.preventDefault()
              items[0].focus()
            } else if (e.key === 'End') {
              e.preventDefault()
              items[items.length - 1].focus()
            } else if (e.key === 'Escape') {
              e.preventDefault()
              onClose()
              triggerRef.current?.focus()
            }
          }}
        >
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
