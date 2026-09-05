'use client'

import { Img } from '@/components/Img'
import { getArticle } from '@/content/articles'
import { getThought } from '@/content/thoughts'
import { useWindows } from '@/os/WindowManager'
import { FileGlyph as PageGlyph } from './ui/FileGlyph'
import { WindowHeader } from './ui/WindowHeader'

/** File kind drives the color-coded page glyph on each book's file chips. */
type FileKind = 'note' | 'quote' | 'pdf'

type BookFile = { name: string; kind: FileKind }

/** The essay a book fed — an article or a thought, opened in its reader window. */
type Essay = { app: 'article' | 'thoughts'; slug: string }

type Book = {
  title: string
  author: string
  blurb: string
  /**
   * Small cover image, self-hosted in /public/books (Open Library's medium
   * covers, ~180px wide — plenty for the 64px thumbnail, and hosting them
   * locally means no third-party hotlink to break). Shown on the left of the
   * card and linked to `goodreads`.
   */
  cover: string
  /** The book's Goodreads page (reviews + ratings), opened in a new tab. */
  goodreads: string
  /** A little genre/mood pill, shown top-right of the card. */
  tag: string
  /** The piece of writing this book led to; rendered as a "Read more →" chip. */
  essay: Essay
  /**
   * Notes & files kept on this book. Empty for now — Jun may add favourite
   * quotes per book later, so the shape (and its glyphs) stay in place.
   */
  files?: BookFile[]
}

/**
 * The "Books" app — six recommendations, in the order of
 * kb/refined/books/INDEX.md. Each blurb ends where the long version begins, so
 * every card links to the essay the book fed rather than repeating it here.
 */
const books: Book[] = [
  {
    title: 'The Tell-Tale Brain',
    cover: '/books/tell-tale-brain.jpg',
    goodreads: 'https://www.goodreads.com/book/show/8574712-the-tell-tale-brain',
    author: 'V.S. Ramachandran',
    blurb:
      'A UC San Diego neuroscientist studies the brain with cheap, ingenious experiments — relieving phantom-limb pain with a mirror box — instead of heavy imaging. He works the way physicists always have: hypothesis first, then an experiment that reveals the mechanism indirectly. It changed how I read AI papers.',
    tag: '🧠 neuroscience',
    essay: { app: 'article', slug: 'why-biology' },
  },
  {
    title: 'Einstein: His Life and Universe',
    cover: '/books/einstein.jpg',
    goodreads: 'https://www.goodreads.com/book/show/10884.Einstein',
    author: 'Walter Isaacson',
    blurb:
      'What stayed with me is Einstein outgrowing Ernst Mach’s strict positivism: what cannot be observed directly or indirectly doesn’t exist. That "indirectly" is where real science lives, and it pairs with The Tell-Tale Brain.',
    tag: '🔭 biography',
    essay: { app: 'article', slug: 'why-biology' },
  },
  {
    title: 'Guns, Germs, and Steel',
    cover: '/books/guns-germs-and-steel.jpg',
    goodreads: 'https://www.goodreads.com/book/show/1842.Guns_Germs_and_Steel',
    author: 'Jared Diamond',
    blurb:
      'Environment, not people, explains why civilizations diverged; food-production efficiency decided everything. My takeaway: each technological revolution frees humanity from survival for creative work, and AI is the next one.',
    tag: '📜 history',
    essay: { app: 'thoughts', slug: 'why-im-optimistic-about-ai' },
  },
  {
    title: 'The Robot and Foundation novels',
    // The series has no single Goodreads page; The Caves of Steel is where R.
    // Daneel's story (and the blurb) starts, so its cover and page stand in.
    cover: '/books/caves-of-steel.jpg',
    goodreads: 'https://www.goodreads.com/book/show/41811.The_Caves_of_Steel',
    author: 'Isaac Asimov',
    blurb:
      'R. Daneel Olivaw, from The Caves of Steel to Foundation and Earth, doesn’t serve humans; he serves a law he derived himself and steers human choices for twenty thousand years to reach it. A smart enough robot will optimize toward its own objective whatever laws we give it.',
    tag: '🚀 science fiction',
    essay: { app: 'thoughts', slug: 'chemistry-is-the-optimizer' },
  },
  {
    title: "Descartes' Error",
    cover: '/books/descartes-error.jpg',
    goodreads: 'https://www.goodreads.com/book/show/103867.Descartes_Error',
    author: 'Antonio Damasio',
    blurb:
      'Patients who lost emotional perception understood the right choice and still couldn’t act on it. Reason is a tool; the chemistry we call emotion is what moves us. Read early, and it planted the view of the brain I still hold.',
    tag: '💓 emotion',
    essay: { app: 'thoughts', slug: 'chemistry-is-the-optimizer' },
  },
  {
    title: 'Principles',
    cover: '/books/principles.jpg',
    goodreads: 'https://www.goodreads.com/book/show/34536488-principles',
    author: 'Ray Dalio',
    blurb:
      'A financier’s rules for doing anything. The first and deepest is face reality — seek truth from facts — which I read on three levels and which gave me my post-mortem habit.',
    tag: '⚖️ decisions',
    essay: { app: 'thoughts', slug: 'face-reality' },
  },
]

/** The reader-window title for an essay link (falls back to the app's own name). */
function essayTitle(essay: Essay): string | undefined {
  return essay.app === 'article'
    ? getArticle(essay.slug)?.title
    : (getThought(essay.slug)?.title ?? 'Thoughts')
}

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
            {/* Cover on the left, a link out to the book's Goodreads page. The
                fixed 64×96 box keeps every card's text column aligned whatever
                the cover's own aspect ratio; `object-cover` crops the odd one
                rather than letterboxing it. */}
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
                  onClick={() =>
                    openApp(book.essay.app, {
                      params: { slug: book.essay.slug },
                      title: essayTitle(book.essay),
                    })
                  }
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

                {/* Favourite quotes / notes per book — none attached yet. */}
                {book.files?.map((file) => (
                  <span
                    key={file.name}
                    className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 text-xs text-muted"
                  >
                    <FileGlyph kind={file.kind} />
                    {file.name}
                  </span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Tiny page glyph, color-coded by file kind (a small echo of the File Explorer's).
    The page silhouette + folded corner come from the shared <FileGlyph> primitive;
    only the colored rule-lines are drawn here. Tokens mirror the File Explorer's so
    the shared logical colors stay in lockstep: note→--accent (= Files' doc),
    quote→--accent-2 (= Files' csv), pdf→--file-exe. */
function FileGlyph({ kind }: { kind: FileKind }) {
  const color = {
    note: 'rgb(var(--accent))',
    quote: 'rgb(var(--accent-2))',
    pdf: 'rgb(var(--file-exe))',
  }[kind]
  return (
    <PageGlyph width={11} height={13} className="flex-none">
      <path
        d="M5.5 12 h7 M5.5 15 h7 M5.5 18 h5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </PageGlyph>
  )
}
