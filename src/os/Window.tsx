'use client'

import { motion, useDragControls, type PanInfo } from 'framer-motion'
import { type RefObject } from 'react'
import { apps } from './apps'
import { useWindows } from './WindowManager'
import type { WindowInstance } from './types'

const MIN = { width: 240, height: 160 }

/**
 * One draggable / resizable window.
 *
 * Dragging: the whole frame is a `motion.div` with `drag`, but `dragListener`
 * is false so a drag can ONLY be started from the title bar (`controls.start`).
 * We don't write position to state mid-drag — Framer moves the element via its
 * own transform, and we commit the final position once in `onDragEnd`. The
 * `animate` x/y then re-asserts state as the source of truth.
 *
 * Resizing: a tiny corner handle with self-cancelling constraints so it never
 * actually moves; only its drag *delta* is fed into the window's width/height.
 */
export function Window({ win }: { win: WindowInstance }) {
  const { focusedId, focusWindow, closeWindow, updateWindow, constraintsRef } = useWindows()
  const controls = useDragControls()
  const def = apps[win.appId]
  const Body = def?.Component
  const focused = focusedId === win.id

  function handleDragEnd(_event: unknown, info: PanInfo) {
    updateWindow(win.id, {
      position: {
        x: win.position.x + info.offset.x,
        y: win.position.y + info.offset.y,
      },
    })
  }

  function handleResize(_event: unknown, info: PanInfo) {
    updateWindow(win.id, {
      size: {
        width: Math.max(win.size.width + info.delta.x, MIN.width),
        height: Math.max(win.size.height + info.delta.y, MIN.height),
      },
    })
  }

  return (
    <motion.div
      className="os-window pointer-events-auto absolute"
      style={{ zIndex: win.zIndex }}
      initial={{ x: win.position.x, y: win.position.y, scale: 0.85, opacity: 0 }}
      animate={{
        x: win.position.x,
        y: win.position.y,
        width: win.size.width,
        height: win.size.height,
        scale: 1,
        opacity: focused ? 1 : 0.97,
      }}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 520, damping: 36 }}
      drag
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={constraintsRef as unknown as RefObject<Element>}
      onMouseDown={() => focusWindow(win.id)}
      onDragEnd={handleDragEnd}
    >
      <div className="os-titlebar" onPointerDown={(e) => controls.start(e)}>
        {/* left spacer balances the close button so the title sits centered */}
        <span className="w-5" aria-hidden />
        <span className="os-title">
          {def?.icon} {win.title}
        </span>
        <button
          type="button"
          aria-label="Close window"
          className="os-close"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => closeWindow(win.id)}
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">{Body ? <Body /> : <p>Unknown app.</p>}</div>

      <motion.div
        className="os-resize"
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onPointerDown={(e) => e.stopPropagation()}
        onDrag={handleResize}
      />
    </motion.div>
  )
}
