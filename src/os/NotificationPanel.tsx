'use client'

import { AnimatePresence, motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import { Img } from '@/components/Img'
import { notifications, type NotificationMeta } from '@/content/notifications'
import { MENUBAR_HEIGHT } from './constants'

const loaders = Object.fromEntries(notifications.map((n) => [n.slug, n.load]))

function NotificationCard({ meta }: { meta: NotificationMeta }) {
  const Body = dynamic(loaders[meta.slug], { loading: () => <p className="text-muted">...</p> })
  return (
    <div className="os-notif-card">
      <div className="os-notif-card-head">
        <span className="os-notif-card-title">{meta.title}</span>
        <span className="os-notif-card-date">{meta.date}</span>
      </div>
      <div className="os-notif-card-body">
        <Body />
      </div>
    </div>
  )
}

export function NotificationPanel({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          className="os-notif-panel"
          style={{ top: MENUBAR_HEIGHT }}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 34 }}
        >
          <div className="os-notif-list">
            {notifications.map((n) => (
              <NotificationCard key={n.slug} meta={n} />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function NotificationBell({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Notifications"
      onClick={onClick}
      className="os-tray-item"
    >
      <Img src="/icons/bell.png" alt="" className="h-5 w-5 object-contain" draggable={false} />
    </button>
  )
}
