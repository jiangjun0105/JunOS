'use client'

import { motion, useDragControls, useMotionValue, type PanInfo } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { apps, isAppId } from './apps'
import { MENUBAR_HEIGHT, MIN_WINDOW_SIZE as MIN } from './constants'
import { asElementRef } from './refs'
import { useWindows } from './WindowManager'
import { WindowScrollbar } from './WindowScrollbar'
import type { WindowInstance } from './types'

/** Pixels a window moves (or grows/shrinks) per arrow-key press — see ACC-2. */
const KEYBOARD_STEP = 16

/** Default padding for a window's scrollable body. Apps can override it via
 *  `AppDefinition.bodyPadding` (e.g. Email tightens its side margins). */
const DEFAULT_BODY_PADDING = 'px-10 py-4'

/**
 * The drag zones that resize a window. Each is an invisible strip pinned to a
 * border (or the corner); `axes` says which dimension(s) it grows. Right edge →
 * width, bottom edge → height, corner → both. The window's top-left never moves,
 * so width/height are all we ever touch.
 */
const RESIZE_HANDLES = [
  { key: 'e', className: 'os-resize-e', axes: { x: true } },
  { key: 's', className: 'os-resize-s', axes: { y: true } },
  { key: 'se', className: 'os-resize', axes: { x: true, y: true } },
] as const

/** Keep a window on-screen: never under the menu bar, and never fully off any edge. */
function clampPosition(x: number, y: number): { x: number; y: number } {
  if (typeof window === 'undefined') return { x, y }
  const maxX = Math.max(0, window.innerWidth - 120) // keep ~120px on screen horizontally
  const maxY = Math.max(MENUBAR_HEIGHT, window.innerHeight - 44) // keep the title bar reachable
  return {
    x: Math.min(Math.max(x, 0), maxX),
    y: Math.min(Math.max(y, MENUBAR_HEIGHT), maxY),
  }
}

/**
 * One draggable / resizable window.
 *
 * Dragging: the whole frame is a `motion.div` with `drag`, but `dragListener`
 * is false so a drag can ONLY be started from the title bar (`controls.start`).
 * We don't write position to state mid-drag — Framer moves the element via its
 * own transform, and we commit the final (clamped) position once in `onDragEnd`.
 *
 * Resizing: width/height are driven by Framer MOTION VALUES, not React state, so
 * a resize updates the DOM directly — no per-frame re-render of every window and
 * no spring lagging behind the cursor. The final size is committed to state once
 * on resize-end (the same pattern as position). When state size changes for other
 * reasons (open, maximize/restore, viewport re-fit) the motion values re-sync.
 *
 * Keyboard: the frame is focusable (role="dialog"); it's focused on open, and
 * Escape closes it. It is intentionally NOT a focus trap — windows are non-modal,
 * so you must be able to Tab between them.
 *
 * Chrome: apps can opt into a decorative File/Edit/View/Help toolbar; scrolling
 * content shows a Win95-style chrome scrollbar (see WindowScrollbar).
 */
export function Window({ win }: { win: WindowInstance }) {
  const { focusedId, focusWindow, closeWindow, updateWindow, minimizeWindow, toggleMaximize, constraintsRef } =
    useWindows()
  const controls = useDragControls()
  // `win.appId` is typed `string` (kept loose to avoid a types<->apps cycle);
  // `isAppId` narrows it to the strict `AppId` so the lookup is cast-free. The
  // optional chain below already tolerates an unknown id.
  const def = isAppId(win.appId) ? apps[win.appId] : undefined
  const Body = def?.Component
  const focused = focusedId === win.id

  const width = useMotionValue(win.size.width)
  const height = useMotionValue(win.size.height)
  const resizing = useRef(false)
  const frameRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Re-sync the live size from state whenever it changes for a reason OTHER than
  // an in-progress resize (open, maximize/restore, viewport re-fit).
  useEffect(() => {
    if (resizing.current) return
    width.set(win.size.width)
    height.set(win.size.height)
  }, [win.size.width, win.size.height, width, height])

  // Focus a newly opened (or restored) window so keyboard users land in it.
  useEffect(() => {
    frameRef.current?.focus({ preventScroll: true })
  }, [])

  // ACC-4 focus restoration (moving focus to the next window after a close /
  // minimize) is driven from OSRoot by window id — not from here — because the
  // closing window lingers through its exit animation, so an activeElement-based
  // heuristic in this component can't tell "focus was lost" apart from "the old
  // window is still animating out". See OSRoot.tsx.

  function handleDragEnd(_event: unknown, info: PanInfo) {
    updateWindow(win.id, {
      position: clampPosition(win.position.x + info.offset.x, win.position.y + info.offset.y),
    })
  }

  // Clamp a desired size to the floor (MIN) and the viewport cap (the window's
  // top-left is fixed, so the cap is the distance from there to each edge). Shared
  // by pointer-resize and keyboard-resize so both obey identical limits.
  function clampSize(w: number, h: number): { width: number; height: number } {
    const maxW = typeof window !== 'undefined' ? window.innerWidth - win.position.x : Infinity
    const maxH = typeof window !== 'undefined' ? window.innerHeight - win.position.y : Infinity
    return {
      width: Math.min(Math.max(w, MIN.width), maxW),
      height: Math.min(Math.max(h, MIN.height), maxH),
    }
  }

  // Apply the pointer delta to width and/or height (the `axes` flags say which).
  // Growth is capped at the viewport edges, relative to the window's fixed top-left.
  function handleResize(info: PanInfo, axes: { x?: boolean; y?: boolean }) {
    const next = clampSize(
      width.get() + (axes.x ? info.delta.x : 0),
      height.get() + (axes.y ? info.delta.y : 0)
    )
    if (axes.x) width.set(next.width)
    if (axes.y) height.set(next.height)
  }

  function handleResizeEnd() {
    resizing.current = false
    updateWindow(win.id, { size: { width: width.get(), height: height.get() } })
  }

  // ACC-2: make the window keyboard-operable from its (now focusable) frame.
  // Arrows move it; Shift+arrows resize it. We ONLY act when the frame ITSELF is
  // the event target (`e.target === e.currentTarget`) so we never hijack arrow
  // keys while focus is inside the body (links, inputs, scrollable content).
  function handleFrameKeys(e: React.KeyboardEvent<HTMLDivElement>) {
    // A maximized window is geometry-locked (mirrors the drag/resize guards).
    if (win.maximized || e.target !== e.currentTarget) return

    // Map each arrow to a (dx, dy) unit; non-arrows fall through unhandled.
    const deltas: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }
    const dir = deltas[e.key]
    if (!dir) return

    // preventDefault so arrows move/resize the window instead of scrolling the page.
    e.preventDefault()
    const [dx, dy] = dir
    if (e.shiftKey) {
      // Shift+arrow → resize. Right/Down grow, Left/Up shrink (down to MIN).
      const size = clampSize(
        win.size.width + dx * KEYBOARD_STEP,
        win.size.height + dy * KEYBOARD_STEP
      )
      updateWindow(win.id, { size })
    } else {
      // Arrow → move, clamped on-screen exactly like a pointer drag.
      const position = clampPosition(
        win.position.x + dx * KEYBOARD_STEP,
        win.position.y + dy * KEYBOARD_STEP
      )
      updateWindow(win.id, { position })
    }
  }

  return (
    <motion.div
      ref={frameRef}
      id={`window-${win.id}`}
      className={`os-window pointer-events-auto absolute outline-none ${focused ? 'is-active' : ''}`}
      role="dialog"
      aria-label={win.title}
      // ACC-5: these windows are intentionally non-modal (you can Tab between
      // them; they don't trap focus), so tell AT it's not a modal it can't escape.
      aria-modal={false}
      // ACC-2: focusable so keyboard users can Tab to the window (and reach the
      // titlebar's minimize/maximize/close buttons) and drive it via the keyboard.
      tabIndex={0}
      style={{ zIndex: win.zIndex, width, height }}
      initial={{ x: win.position.x, y: win.position.y, scale: 0.85, opacity: 0 }}
      animate={{
        x: win.position.x,
        y: win.position.y,
        scale: 1,
        opacity: focused ? 1 : 0.94,
      }}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 520, damping: 36 }}
      drag={!win.maximized}
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={asElementRef(constraintsRef)}
      onPointerDown={() => focusWindow(win.id)}
      onDragEnd={handleDragEnd}
      onKeyDown={(e) => {
        // Escape closes the window — unless the user is typing in a field.
        if (e.key === 'Escape') {
          const target = e.target as HTMLElement
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
          closeWindow(win.id)
          return
        }
        // ACC-2: arrow / Shift+arrow move/resize when the frame itself is focused.
        handleFrameKeys(e)
      }}
    >
      <div
        className="os-titlebar"
        onPointerDown={(e) => {
          // A maximized window can't be dragged.
          if (!win.maximized) controls.start(e)
        }}
      >
        <span className="os-title">{win.title}</span>
        <div className="os-btns">
          <button
            type="button"
            aria-label="Minimize window"
            title="Minimize"
            className="os-btn"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => minimizeWindow(win.id)}
          >
            <span>–</span>
          </button>
          <button
            type="button"
            aria-label={win.maximized ? 'Restore window' : 'Maximize window'}
            title={win.maximized ? 'Restore' : 'Maximize'}
            className="os-btn"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => toggleMaximize(win.id)}
          >
            <span>{win.maximized ? '❐' : '▢'}</span>
          </button>
          <button
            type="button"
            aria-label="Close window"
            title="Close"
            className="os-btn os-btn-close"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => closeWindow(win.id)}
          >
            <span>✕</span>
          </button>
        </div>
      </div>

      {/* decorative File/Edit/View/Help toolbar, opt-in per app */}
      {def?.toolbar && (
        <div className="win-menu">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Help</span>
        </div>
      )}

      <div className="relative flex min-h-0 flex-1">
        <div
          ref={contentRef}
          className={`os-scroll-host min-h-0 flex-1 overflow-auto ${def?.bodyPadding ?? DEFAULT_BODY_PADDING}`}
        >
          {/* A crash in a window body (e.g. a failed lazy MDX chunk) is contained
              here so it can't take down the whole desktop; see ErrorBoundary. */}
          <ErrorBoundary>{Body ? <Body params={win.params} /> : <p>Unknown app.</p>}</ErrorBoundary>
        </div>
        <WindowScrollbar targetRef={contentRef} />
      </div>

      {!win.maximized &&
        RESIZE_HANDLES.map((handle) => (
          <motion.div
            key={handle.key}
            className={handle.className}
            drag
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            onPointerDown={(e) => {
              // ACC-7: grabbing a resize edge of a background window should raise it.
              // The handle's stopPropagation (below) prevents the frame's own
              // onPointerDown from firing, so focus it explicitly here first.
              focusWindow(win.id)
              e.stopPropagation()
            }}
            onDragStart={() => {
              resizing.current = true
            }}
            onDrag={(_event, info) => handleResize(info, handle.axes)}
            onDragEnd={handleResizeEnd}
          />
        ))}
    </motion.div>
  )
}
