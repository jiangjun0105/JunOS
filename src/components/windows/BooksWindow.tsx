'use client'

import { Img } from '@/components/Img'
import { useWindows } from '@/os/WindowManager'
import { books } from '@/content/books'
import { WindowHeader } from './ui/WindowHeader'

export function BooksWindow() {
  const { openApp } = useWindows()

  return (
    <div className="space-y-4">
      <WindowHeader
        title="Books"
        subtitle="Six books, one paragraph each — and the essay each one fed."
      />

      <ul className="space-y-3">
        {books.map((book) => (
          <li key={book.title} className="os-card flex gap-3">
            {/* Fixed box keeps text columns aligned; object-cover crops odd aspect ratios. */}
            <a
              href={book.goodreads}
              target="_blank"
              rel="noopener noreferrer"
              title={`${book.title} on Goodreads`}
              aria-label={`${book.title} on Goodreads`}
              className="book-cover"
            >
              <Img src={book.cover} alt="" draggable={false} />
            </a>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-body font-bold">{book.title}</p>
                  <p className="text-sm text-muted">{book.author}</p>
                </div>
                <span className="os-pill flex-none">{book.tag}</span>
              </div>

              <p className="mt-1.5 text-sm text-muted">{book.blurb}</p>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  className="os-action-btn"
                  onClick={() => openApp(book.essay.app, { params: { slug: book.essay.slug } })}
                >
                  Read more →
                </button>
                <a
                  href={book.goodreads}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="os-pill text-muted transition-colors hover:text-ink"
                >
                  Goodreads ↗
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
