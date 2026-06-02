'use client'

import { useState } from 'react'
import { sectionsByKind, type ArticleKind } from '@/content/articles'
import { notifications } from '@/content/notifications'
import type { AppId } from '@/os/apps'
import { useWindows } from '@/os/WindowManager'
import { FileGlyph as PageGlyph } from './ui/FileGlyph'

/** File kind drives the color-coded page glyph (matching the sample project). */
type FileKind = 'doc' | 'txt' | 'csv' | 'exe'

/** A node in the file tree: a folder (expandable) or a file that opens an app. */
type TreeNode =
  | { kind: 'folder'; name: string; children: TreeNode[] }
  | {
      kind: 'file'
      name: string
      appId: AppId
      fileKind?: FileKind
      params?: Record<string, unknown>
    }

/**
 * A kind's articles become a two-layer tree: one sub-folder per section, each
 * holding the article "files" that open the reader with their slug.
 */
function articleFolders(kind: ArticleKind): TreeNode[] {
  return sectionsByKind(kind).map((section) => ({
    kind: 'folder' as const,
    name: section.name,
    children: section.articles.map((a) => ({
      kind: 'file' as const,
      name: a.title,
      appId: 'article',
      fileKind: 'doc' as const,
      params: { slug: a.slug },
    })),
  }))
}

/**
 * The tree shown in the File Explorer. Files open their app's window on click; the
 * Research / Personal folders are generated from src/content/articles, so new
 * articles appear here automatically. Extend or nest more folders to grow it.
 */
const TREE: TreeNode[] = [
  {
    kind: 'folder',
    name: 'JunOS',
    children: [
      { kind: 'file', name: 'About me', appId: 'about', fileKind: 'doc' },
      { kind: 'file', name: 'Development', appId: 'projects', fileKind: 'csv' },
      { kind: 'file', name: 'Support', appId: 'support', fileKind: 'exe' },
    ],
  },
  { kind: 'folder', name: 'Research', children: articleFolders('research') },
  { kind: 'folder', name: 'Personal', children: articleFolders('personal') },
  {
    kind: 'folder',
    name: 'Notifications',
    children: notifications.map((n) => ({
      kind: 'file' as const,
      name: n.title,
      appId: 'notification' as AppId,
      fileKind: 'doc' as const,
      params: { slug: n.slug },
    })),
  },
]

/** File Explorer — an expandable folder tree (like the Hand-drawn OS design). */
export function FilesWindow() {
  return (
    <div className="tree">
      {TREE.map((node, i) => (
        <TreeRow key={i} node={node} />
      ))}
    </div>
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
            {node.children.map((child, i) => (
              <TreeRow key={i} node={child} />
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
      onClick={() =>
        openApp(node.appId, node.params ? { params: node.params, title: node.name } : undefined)
      }
    >
      <span className="tree-twist" aria-hidden />
      <span className="tree-ico">
        <FileGlyph kind={node.fileKind} />
      </span>
      <span className="tree-name">{node.name}</span>
    </button>
  )
}

/** Yellow folder glyph (matches the sample's tree folder; outline = currentColor/ink). */
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

/** Simple page glyph, color-coded by file kind (matches the sample).
    The page silhouette + folded corner come from the shared <FileGlyph> primitive;
    only the colored rule-lines (a small grid for csv, horizontal rules otherwise)
    are drawn here. Colors are theme tokens (theme.css) so the palette is
    reskinnable; doc reuses --accent and csv reuses --accent-2 — the same tokens
    Books' note/quote use. */
function FileGlyph({ kind }: { kind?: FileKind }) {
  const color = kind
    ? {
        doc: 'rgb(var(--accent))',
        txt: 'rgb(var(--file-txt))',
        csv: 'rgb(var(--accent-2))',
        exe: 'rgb(var(--file-exe))',
      }[kind]
    : 'rgb(var(--file-default))'
  return (
    <PageGlyph width={15} height={18}>
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
    </PageGlyph>
  )
}
