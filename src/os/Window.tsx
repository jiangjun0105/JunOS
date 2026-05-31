'use client'

import { motion, useDragControls, useMotionValue, type PanInfo } from 'framer-motion'
import { useEffect, useRef, type RefObject } from 'react'
import { apps } from './apps'
import { MENUBAR_HEIGHT } from './constants'
import { useWindows } from './WindowManager'
import type { WindowInstance } from './types'

const MIN = { width: 240, height: 160 }

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
 */
export function Window({ win }: { win: WindowInstance }) {
  const { focusedId, focusWindow, closeWindow, updateWindow, minimizeWindow, toggleMaximize, constraintsRef } =
    useWindows()
  const controls = useDragControls()
  const def = apps[win.appId]
  const Body = def?.Component
  const focused = focusedId === win.id

  const width = useMotionValue(win.size.width)
  const height = useMotionValue(win.size.height)
  const resizing = useRef(false)
  const frameRef = useRef<HTMLDivElement>(null)

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

  function handleDragEnd(_event: unknown, info: PanInfo) {
    updateWindow(win.id, {
      position: clampPosition(win.position.x + info.offset.x, win.position.y + info.offset.y),
    })
  }

  function handleResize(_event: unknown, info: PanInfo) {
    // cap growth at the viewport edges (relative to the window's current position)
    const maxW = typeof window !== 'undefined' ? window.innerWidth - win.position.x : Infinity
    const maxH = typeof window !== 'undefined' ? window.innerHeight - win.position.y : Infinity
    width.set(Math.min(Math.max(width.get() + info.delta.x, MIN.width), maxW))
    height.set(Math.min(Math.max(height.get() + info.delta.y, MIN.height), maxH))
  }

  function handleResizeEnd() {
    resizing.current = false
    updateWindow(win.id, { size: { width: width.get(), height: height.get() } })
  }

  return (
    <motion.div
      ref={frameRef}
      className={`os-window pointer-events-auto absolute outline-none ${focused ? 'is-active' : ''}`}
      role="dialog"
      aria-label={win.title}
      tabIndex={-1}
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
      dragConstraints={constraintsRef as unknown as RefObject<Element>}
      onPointerDown={() => focusWindow(win.id)}
      onDragEnd={handleDragEnd}
      onKeyDown={(e) => {
        // Escape closes the window — unless the user is typing in a field.
        if (e.key !== 'Escape') return
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
        closeWindow(win.id)
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
            className="os-btn"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => minimizeWindow(win.id)}
          >
            <span>–</span>
          </button>
          <button
            type="button"
            aria-label={win.maximized ? 'Restore window' : 'Maximize window'}
            className="os-btn"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => toggleMaximize(win.id)}
          >
            <span>{win.maximized ? '❐' : '▢'}</span>
          </button>
          <button
            type="button"
            aria-label="Close window"
            className="os-btn os-btn-close"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => closeWindow(win.id)}
          >
            <span>✕</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">{Body ? <Body /> : <p>Unknown app.</p>}</div>

      {!win.maximized && (
        <motion.div
          className="os-resize"
          drag
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          onPointerDown={(e) => e.stopPropagation()}
          onDragStart={() => {
            resizing.current = true
          }}
          onDrag={handleResize}
          onDragEnd={handleResizeEnd}
        />
      )}
    </motion.div>
  )
}
