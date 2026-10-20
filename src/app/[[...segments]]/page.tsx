import type { Metadata } from 'next'
import { CityDesktop } from '@/os/CityDesktop'
import { appList, isLaunchable, type AppId } from '@/os/apps'
import { articles, getArticle, type ArticleKind } from '@/content/articles'
import { thoughts, getThought } from '@/content/thoughts'
import { parseWindowPath } from '@/os/url'
import { DESCRIPTION, SITE_URL } from '@/site'

// Every path renders the desktop; WindowUrlSync reads the URL and opens the matching window.
export default function Home() {
  return <CityDesktop />
}

// Articles share the link-preview card of the window that lists them.
const KIND_ICON: Record<ArticleKind, string> = {
  research: 'research',
  project: 'projects',
  personal: 'about',
}

// Without this, an optional catch-all renders on demand; enumerating paths makes them static.
export function generateStaticParams(): { segments: string[] }[] {
  return [
    { segments: [] },
    ...appList.filter((a) => isLaunchable(a.id as AppId)).map((a) => ({ segments: [a.id] })),
    ...articles.map((a) => ({ segments: ['article', a.slug] })),
    ...thoughts.map((t) => ({ segments: ['thoughts', t.slug] })),
  ]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segments?: string[] }>
}): Promise<Metadata> {
  const { segments } = await params
  const intent = parseWindowPath('/' + (segments ?? []).join('/'))

  const doc =
    intent?.slug &&
    (intent.appId === 'article'
      ? getArticle(intent.slug)
      : intent.appId === 'thoughts'
        ? getThought(intent.slug)
        : undefined)

  const article = intent?.appId === 'article' && intent.slug ? getArticle(intent.slug) : undefined
  const icon = article ? KIND_ICON[article.kind] : intent?.appId
  const images = icon && icon !== 'article' ? [`${SITE_URL}/og/${icon}`] : undefined

  if (intent && doc) {
    const { title, summary } = doc
    const canonical = `${SITE_URL}/${intent.appId}/${encodeURIComponent(doc.slug)}`
    return {
      title,
      description: summary,
      openGraph: {
        title,
        description: summary,
        type: 'article',
        url: canonical,
        images,
      },
      alternates: { canonical },
    }
  }

  return {
    title: 'JunOS',
    description: DESCRIPTION,
    openGraph: { title: 'JunOS', description: DESCRIPTION, type: 'website', url: SITE_URL, images },
    alternates: { canonical: SITE_URL },
  }
}
