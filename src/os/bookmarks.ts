'use client'

import { useCallback, useSyncExternalStore } from 'react'

export interface Bookmark {
  id: string
  appId: string
  title: string
  params?: Record<string, unknown>
}

const STORAGE_KEY = 'junos-bookmarks'

function read(): Bookmark[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function write(bookmarks: Bookmark[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks))
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }))
}

let listeners: Array<() => void> = []

function subscribe(cb: () => void) {
  listeners = [...listeners, cb]
  function onStorage(e: StorageEvent) {
    if (e.key === STORAGE_KEY || e.key === null) cb()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners = listeners.filter((l) => l !== cb)
    window.removeEventListener('storage', onStorage)
  }
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) ?? '[]'
}

function getServerSnapshot() {
  return '[]'
}

export function useBookmarks() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const bookmarks: Bookmark[] = JSON.parse(raw)

  const addBookmark = useCallback((appId: string, title: string, params?: Record<string, unknown>) => {
    const current = read()
    const exists = current.some(
      (b) => b.appId === appId && JSON.stringify(b.params) === JSON.stringify(params)
    )
    if (exists) return
    const bookmark: Bookmark = {
      id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      appId,
      title,
      params,
    }
    write([...current, bookmark])
  }, [])

  const removeBookmark = useCallback((id: string) => {
    write(read().filter((b) => b.id !== id))
  }, [])

  const isBookmarked = useCallback(
    (appId: string, params?: Record<string, unknown>) => {
      return bookmarks.some(
        (b) => b.appId === appId && JSON.stringify(b.params) === JSON.stringify(params)
      )
    },
    [bookmarks]
  )

  const toggleBookmark = useCallback((appId: string, title: string, params?: Record<string, unknown>) => {
    const current = read()
    const existing = current.find(
      (b) => b.appId === appId && JSON.stringify(b.params) === JSON.stringify(params)
    )
    if (existing) {
      write(current.filter((b) => b.id !== existing.id))
    } else {
      const bookmark: Bookmark = {
        id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        appId,
        title,
        params,
      }
      write([...current, bookmark])
    }
  }, [])

  return { bookmarks, addBookmark, removeBookmark, toggleBookmark, isBookmarked }
}
