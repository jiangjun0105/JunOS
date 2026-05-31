'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

/**
 * A Win95-style chrome scrollbar (▲ button · track with a draggable pill thumb ·
 * ▼ button) that drives a scrollable element — replacing the native scrollbar to
 * match the Hand-drawn OS design. Renders only when the target actually overflows.
 *
 * The target keeps `overflow:auto` (wheel/keyboard scrolling still work natively);
 * this just adds the visible chrome + arrow/thumb interactions, synced both ways.
 */
export function WindowScrollbar({ targetRef }: { targetRef: RefObject<HTMLElement | null> }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState({ visible: false, thumbTop: 0, thumbHeight: 24 })

  const measure = useCallback(() => {
    const el = targetRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    const overflow = scrollHeight - clientHeight
    const visible = overflow > 1
    const trackH = trackRef.current?.clientHeight ?? clientHeight
    const thumbHeight = visible ? Math.max(24, (clientHeight / scrollHeight) * trackH) : trackH
    const thumbTop = visible && trackH > thumbHeight ? (scrollTop / overflow) * (trackH - thumbHeight) : 0
    setView({ visible, thumbTop, thumbHeight })
  }, [targetRef])

  useEffect(() => {
    const el = targetRef.current
    if (!el) return
    measure()
    el.addEventListener('scroll', measure, { passive: true })
    // observe the host (resize) and its content (height changes, e.g. tree expand)
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => {
      el.removeEventListener('scroll', measure)
      ro.disconnect()
    }
  }, [targetRef, measure])

  function step(direction: number) {
    targetRef.current?.scrollBy({ top: direction * 48, behavior: 'smooth' })
  }

  function onThumbPointerDown(e: React.PointerEvent) {
    e.preventDefault()
    e.stopPropagation()
    const el = targetRef.current
    const track = trackRef.current
    if (!el || !track) return
    const startY = e.clientY
    const startScroll = el.scrollTop
    const overflow = el.scrollHeight - el.clientHeight
    const trackH = track.clientHeight
    const thumbH = Math.max(24, (el.clientHeight / el.scrollHeight) * trackH)
    const range = trackH - thumbH

    function onMove(ev: PointerEvent) {
      if (range <= 0) return
      el!.scrollTop = startScroll + ((ev.clientY - startY) / range) * overflow
    }
    function onUp() {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  if (!view.visible) return null

  return (
    <div className="os-scrollbar" aria-hidden>
      <button type="button" className="os-scroll-btn" onClick={() => step(-1)}>
        ▲
      </button>
      <div ref={trackRef} className="os-scroll-track">
        <div
          className="os-scroll-thumb"
          style={{ top: view.thumbTop, height: view.thumbHeight }}
          onPointerDown={onThumbPointerDown}
        />
      </div>
      <button type="button" className="os-scroll-btn" onClick={() => step(1)}>
        ▼
      </button>
    </div>
  )
}
