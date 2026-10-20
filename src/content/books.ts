/** The essay a book fed — an article or a thought, opened in its reader window. */
export type Essay = { app: 'article' | 'thoughts'; slug: string }

export interface Book {
  title: string
  author: string
  blurb: string
  /** Self-hosted cover in /public/books, linked to `goodreads`. */
  cover: string
  /** The book's Goodreads page (reviews + ratings), opened in a new tab. */
  goodreads: string
  /** A little genre/mood pill, shown top-right of the card. */
  tag: string
  /** The piece of writing this book led to; rendered as a "Read more →" chip. */
  essay: Essay
}

/** Six recommendations; each card links to the essay the book fed. */
export const books: Book[] = [
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
    // No single series page; The Caves of Steel is where R. Daneel starts.
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
