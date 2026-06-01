'use client'

import { animate, motion, useDragControls, useMotionValue } from 'framer-motion'
import { useEffect, useRef, type RefObject } from 'react'
import { asElementRef } from './refs'
import type { AppDefinition } from './types'

interface DesktopIconProps {
  app: AppDefinition
  position: { x: number; y: number }
  /** Shared desktop bounds so an icon can't be dragged off-screen. */
  constraintsRef: RefObject<HTMLDivElement | null>
  onOpen: () => void
  onMove: (position: { x: number; y: number }) => void
}

/**
 * A draggable launcher icon.
 *  - `dragControls` armed on pointer-down so the whole icon is the drag handle.
 *  - the new position is committed to state (and localStorage) on drag-end.
 *  - a ref guard suppresses the click-to-open that would otherwise fire right
 *    after a drag (the ref survives the re-render that committing the move causes).
 *
 * Position lives in a single pair of MOTION VALUES (driven via `style`), NOT an
 * `animate={{ x, y }}` prop. Because the whole icon is the drag handle, every
 * click momentarily arms a drag; if `animate` and `drag` both drove the transform
 * they'd fight on the re-render that opening a window triggers, and the icon would
 * snap to its top-left origin. One owner = no fight. (The window drives its live
 * size the same way.)
 *
 * If the app provides an `image` (e.g. a 3D render), it's shown bare with a soft
 * contact shadow; otherwise the emoji sits on a puffy clay tile.
 */
export function DesktopIcon({ app, position, constraintsRef, onOpen, onMove }: DesktopIconProps) {
  const controls = useDragControls()
  const draggedRef = useRef(false)

  const x = useMotionValue(position.x)
  const y = useMotionValue(position.y)

  // Spring to a new position when the PARENT changes it (localStorage load,
  // "Reset icon positions"). This never runs mid-drag — a move is only committed
  // on drag-end — so it can't fight the drag gesture.
  useEffect(() => {
    const ax = animate(x, position.x, { type: 'spring', stiffness: 600, damping: 40 })
    const ay = animate(y, position.y, { type: 'spring', stiffness: 600, damping: 40 })
    return () => {
      ax.stop()
      ay.stop()
    }
  }, [position.x, position.y, x, y])

  return (
    <motion.button
      type="button"
      className="os-icon absolute"
      style={{ x, y, touchAction: 'none' }}
      initial={false}
      transition={{ type: 'spring', stiffness: 600, damping: 40 }}
      drag
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={asElementRef(constraintsRef)}
      whileHover={{ scale: 1.05 }}
      whileDrag={{ scale: 1.1, rotate: -3, zIndex: 20 }}
      onPointerDown={(e) => {
        draggedRef.current = false
        controls.start(e)
      }}
      onKeyDown={(e) => {
        // ACC-3: keyboard users open the app with Enter/Space. This is independent
        // of the drag guard (`draggedRef`) — a key press is never a drag — so it
        // fires reliably even right after a pointer interaction.
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      onDragStart={() => {
        draggedRef.current = true
      }}
      onDragEnd={() => {
        // Only a real drag moves the icon. A plain click leaves it untouched
        // (otherwise opening a window would yank the icon to the corner).
        if (!draggedRef.current) return
        onMove({ x: x.get(), y: y.get() })
      }}
      onClick={() => {
        if (!draggedRef.current) onOpen()
      }}
    >
      {app.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={app.image} alt="" className="os-icon-img" draggable={false} />
      ) : (
        <span className="os-icon-tile">{app.icon}</span>
      )}
      <span className="os-icon-label">{app.title}</span>
    </motion.button>
  )
}
