/** File kind drives the color-coded page glyph on each book's file chips. */
type FileKind = 'note' | 'quote' | 'pdf'

type BookFile = { name: string; kind: FileKind }

type Book = {
  title: string
  author: string
  blurb: string
  /** A little genre/mood pill, shown top-right of the card. */
  tag: string
  /** The notes & files I keep on this book — placeholders for now. */
  files: BookFile[]
}

/**
 * A little "Books" app — a shelf of favorites, each with the notes & files I keep
 * on it. Placeholder content for now: swap in your own titles, and later wire the
 * file chips up to real documents. (Card style matches the Development app; the
 * file glyphs echo the File Explorer's pages.)
 */
const books: Book[] = [
  {
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupéry',
    blurb: 'Re-read every few years; it lands differently each time.',
    tag: '🌹 fable',
    files: [
      { name: 'Reading notes.md', kind: 'note' },
      { name: 'Favorite quotes.txt', kind: 'quote' },
    ],
  },
  {
    title: 'Norwegian Wood',
    author: 'Haruki Murakami',
    blurb: 'Quiet and melancholic — full of rainy-afternoon mood.',
    tag: '🍃 novel',
    files: [
      { name: 'Highlights.txt', kind: 'quote' },
      { name: 'Review.pdf', kind: 'pdf' },
    ],
  },
  {
    title: 'Gödel, Escher, Bach',
    author: 'Douglas Hofstadter',
    blurb: 'Strange loops, music, and minds — a forever-bookmark book.',
    tag: '🧠 ideas',
    files: [
      { name: 'Chapter notes.md', kind: 'note' },
      { name: 'Diagrams.pdf', kind: 'pdf' },
      { name: 'Quotes.txt', kind: 'quote' },
    ],
  },
  {
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    blurb: 'A whirlwind tour of how we got from there to here.',
    tag: '📜 history',
    files: [{ name: 'Reading notes.md', kind: 'note' }],
  },
]

export function BooksWindow() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="font-body text-[22px] font-bold">Books</h1>
        <p className="text-[18px] text-muted">A shelf of favorites — and the notes &amp; files I keep on each.</p>
      </div>

      <ul className="space-y-3">
        {books.map((book) => (
          <li key={book.title} className="rounded-tile border border-line bg-surface-2/50 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-body font-bold">{book.title}</p>
                <p className="text-sm text-muted">{book.author}</p>
              </div>
              <span className="flex-none rounded-full border border-line bg-surface px-2 py-0.5 text-xs">
                {book.tag}
              </span>
            </div>

            <p className="mt-1.5 text-sm text-muted">{book.blurb}</p>

            {/* The book's files — static placeholders (nothing to open yet). */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {book.files.map((file) => (
                <span
                  key={file.name}
                  title="Placeholder — no file attached yet"
                  className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 text-xs text-muted"
                >
                  <FileGlyph kind={file.kind} />
                  {file.name}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Tiny page glyph, color-coded by file kind (a small echo of the File Explorer's).
    Tokens mirror the File Explorer's so the shared logical colors stay in lockstep:
    note→--accent (= Files' doc), quote→--accent-2 (= Files' csv), pdf→--file-exe. */
function FileGlyph({ kind }: { kind: FileKind }) {
  const color = { note: 'rgb(var(--accent))', quote: 'rgb(var(--accent-2))', pdf: 'rgb(var(--file-exe))' }[
    kind
  ]
  return (
    <svg viewBox="0 0 19 23" width="11" height="13" aria-hidden className="flex-none">
      <path
        d="M3 2 h8 l5 5 v13 q0 1-1 1 H4 q-1 0-1-1 Z"
        fill="rgb(var(--file-page))"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M11 2 v5 h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M5.5 12 h7 M5.5 15 h7 M5.5 18 h5" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  )
}
