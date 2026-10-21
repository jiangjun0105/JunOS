'use client'

import { useState, type ReactNode } from 'react'
import { sectionsByKind, type ArticleKind } from '@/content/articles'
import { notifications } from '@/content/notifications'
import { thoughts } from '@/content/thoughts'
import { apps, type AppId } from '@/os/apps'
import { useWindows } from '@/os/WindowManager'

/** File kind drives the color-coded page glyph. */
type FileKind = 'doc' | 'txt' | 'csv' | 'exe'

/** A node in the file tree: a folder (expandable) or a file that opens an app. */
type TreeNode =
  | { kind: 'folder'; name: string; children: TreeNode[] }
  | {
      kind: 'file'
      name: string
      appId: AppId
      fileKind?: FileKind
      slug?: string
    }

/**
 * A kind's articles become a two-layer tree: one sub-folder per section, each
 * holding the article "files" that open the reader with their slug. A kind
 * with a single section (`project`) skips the sub-folder and lists its files.
 */
function articleFolders(kind: ArticleKind): TreeNode[] {
  const sections = sectionsByKind(kind).map((section) => ({
    kind: 'folder' as const,
    name: section.name,
    children: section.articles.map((a) => ({
      kind: 'file' as const,
      name: a.title,
      appId: 'article' as const,
      fileKind: 'doc' as const,
      slug: a.slug,
    })),
  }))
  return sections.length === 1 ? sections[0].children : sections
}

/** Research / Projects / Personal folders come from src/content/articles; Thoughts and Notifications from their own content folders. */
const shortcut = (appId: AppId, fileKind: FileKind): TreeNode => ({
  kind: 'file',
  name: apps[appId].title,
  appId,
  fileKind,
})

const TREE: TreeNode[] = [
  {
    kind: 'folder',
    name: 'JunOS',
    children: [
      shortcut('about', 'doc'),
      shortcut('research', 'doc'),
      shortcut('projects', 'csv'),
      shortcut('thoughts', 'doc'),
      shortcut('books', 'txt'),
      shortcut('support', 'exe'),
      shortcut('email', 'exe'),
    ],
  },
  { kind: 'folder', name: 'Research', children: articleFolders('research') },
  { kind: 'folder', name: 'Projects', children: articleFolders('project') },
  {
    kind: 'folder',
    name: 'Thoughts',
    children: thoughts.map((t) => ({
      kind: 'file' as const,
      name: t.title,
      appId: 'thoughts',
      fileKind: 'doc' as const,
      slug: t.slug,
    })),
  },
  { kind: 'folder', name: 'Personal', children: articleFolders('personal') },
  {
    kind: 'folder',
    name: 'Notifications',
    children: notifications.map((n) => ({
      kind: 'file' as const,
      name: n.title,
      appId: 'notification',
      fileKind: 'doc' as const,
      slug: n.slug,
    })),
  },
]

/** File Explorer: an expandable folder tree. */
export function FilesWindow() {
  return (
    <>
      <p className="files-sub">Everything on this site, as a tree.</p>
      <div className="tree">
        {TREE.map((node) => (
          <TreeRow key={node.name} node={node} />
        ))}
      </div>
    </>
  )
}

function TreeRow({ node }: { node: TreeNode }) {
  const { openApp } = useWindows()
  const [open, setOpen] = useState(true)

  if (node.kind === 'folder') {
    return (
      <div>
        <button
          type="button"
          className="tree-row"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="tree-twist">{open ? '▾' : '▸'}</span>
          <span className="tree-ico">
            <FolderGlyph />
          </span>
          <span className="tree-name">{node.name}</span>
        </button>
        {open && (
          <div className="tree-children">
            {node.children.map((child) => (
              <TreeRow
                key={`${child.name}:${child.kind === 'file' ? (child.slug ?? child.appId) : ''}`}
                node={child}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      type="button"
      className="tree-row"
      onClick={() => openApp(node.appId, { slug: node.slug })}
    >
      <span className="tree-twist" aria-hidden />
      <span className="tree-ico">
        <KindGlyph kind={node.fileKind} />
      </span>
      <span className="tree-name">{node.name}</span>
    </button>
  )
}

/** Yellow folder glyph. */
function FolderGlyph() {
  return (
    <svg viewBox="0 0 24 20" width="19" height="16" aria-hidden>
      <path
        d="M2 4 h7 l2 2.5 H22 v11 H2 Z"
        fill="rgb(var(--file-folder))"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Page glyph with kind-colored rule-lines (a grid for csv). */
function KindGlyph({ kind }: { kind?: FileKind }) {
  const color = kind
    ? {
        doc: 'rgb(var(--accent))',
        txt: 'rgb(var(--file-txt))',
        csv: 'rgb(var(--accent-2))',
        exe: 'rgb(var(--file-exe))',
      }[kind]
    : 'rgb(var(--file-default))'
  return (
    <FileGlyph>
      {kind === 'csv' ? (
        <path
          d="M5 11.5 h8 M5 14.5 h8 M5 17.5 h8 M9 10.5 v8"
          stroke={color}
          strokeWidth="1.2"
          fill="none"
        />
      ) : (
        <path
          d={`M5 11.5 h7 M5 14.5 h${kind === 'txt' ? 5 : 7} M5 17.5 h6`}
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </FileGlyph>
  )
}

/** Page-with-folded-corner glyph; children are the inner rule-lines. */
function FileGlyph({ children }: { children?: ReactNode }) {
  return (
    <svg viewBox="0 0 19 23" width={15} height={18} aria-hidden>
      <path
        d="M3 2 h8 l5 5 v13 q0 1-1 1 H4 q-1 0-1-1 Z"
        fill="rgb(var(--file-page))"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M11 2 v5 h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {children}
    </svg>
  )
}
