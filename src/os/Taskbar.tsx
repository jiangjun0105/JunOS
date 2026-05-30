'use client'

import { apps } from './apps'
import { TASKBAR_HEIGHT } from './constants'
import { useWindows } from './WindowManager'

/**
 * The bottom dock. It lists every OPEN window (minimized ones included — that's
 * the whole point: a minimized window lives here and nowhere else) and lets you
 * jump between them.
 *
 * Click rules, Windows-style:
 *  - minimized  → restore it (un-hide + bring to front)
 *  - focused    → minimize it (clicking the active one parks it)
 *  - otherwise  → focus it
 *
 * The bar pins to the bottom above the window layer (z-[60] beats the z-50 layer)
 * and is exactly TASKBAR_HEIGHT tall so a maximized window sits flush on top of it.
 */
export function Taskbar() {
  const { windows, focusedId, restoreWindow, minimizeWindow, focusWindow } = useWindows()

  function handleClick(id: string, minimized: boolean) {
    if (minimized) restoreWindow(id)
    else if (id === focusedId) minimizeWindow(id)
    else focusWindow(id)
  }

  return (
    <div className="os-taskbar" style={{ height: TASKBAR_HEIGHT }}>
      {windows.map((win) => {
        const def = apps[win.appId]
        const active = win.id === focusedId
        return (
          <button
            key={win.id}
            type="button"
            onClick={() => handleClick(win.id, win.minimized)}
            title={win.title}
            className={[
              'os-taskbar-item',
              active ? 'is-active' : '',
              win.minimized ? 'is-minimized' : '',
            ].join(' ')}
          >
            <span aria-hidden className="shrink-0 text-base leading-none">
              {def?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={def.image} alt="" className="h-5 w-5 object-contain" draggable={false} />
              ) : (
                def?.icon ?? '▢'
              )}
            </span>
            <span className="truncate">{win.title}</span>
          </button>
        )
      })}
    </div>
  )
}
