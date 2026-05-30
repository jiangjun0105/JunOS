'use client'

import { motion, useDragControls, type PanInfo } from 'framer-motion'
import { useRef, type RefObject } from 'react'
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
 * A draggable launcher icon — the same Framer pattern as the window:
 *  - `dragControls` armed on pointer-down so the whole icon is the drag handle.
 *  - the new position is committed to state (and localStorage) on drag-end.
 *  - a ref guard suppresses the click-to-open that would otherwise fire right
 *    after a drag (the ref survives the re-render that committing the move causes).
 *
 * If the app provides an `image` (e.g. a 3D render), it's shown bare with a soft
 * contact shadow; otherwise the emoji sits on a puffy clay tile.
 */
export function DesktopIcon({ app, position, constraintsRef, onOpen, onMove }: DesktopIconProps) {
  const controls = useDragControls()
  const draggedRef = useRef(false)

  return (
    <motion.button
      type="button"
      className="os-icon absolute"
      style={{ touchAction: 'none' }}
      initial={false}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 600, damping: 40 }}
      drag
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={constraintsRef as unknown as RefObject<Element>}
      whileHover={{ scale: 1.05 }}
      whileDrag={{ scale: 1.1, rotate: -3, zIndex: 20 }}
      onPointerDown={(e) => {
        draggedRef.current = false
        controls.start(e)
      }}
      onDragStart={() => {
        draggedRef.current = true
      }}
      onDragEnd={(_event, info: PanInfo) => {
        onMove({ x: position.x + info.offset.x, y: position.y + info.offset.y })
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
