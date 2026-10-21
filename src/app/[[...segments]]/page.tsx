import type { Metadata } from 'next'
import { CityDesktop } from '@/os/CityDesktop'
import { APPS } from '@/city/landmarks'
import { getDoc } from '@/content'
import type { ArticleKind } from '@/content/articles'
import { sitePaths } from '@/os/paths'
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
  return sitePaths.map((segments) => ({ segments }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segments?: string[] }>
}): Promise<Metadata> {
  const { segments } = await params
  const intent = parseWindowPath('/' + (segments ?? []).join('/'))

  const doc = getDoc(intent?.appId ?? '', intent?.slug)
  const icon = doc?.kind ? KIND_ICON[doc.kind] : intent?.appId
  // Only landmark apps have an /og card.
  const images = APPS.some((a) => a.id === icon) ? [`${SITE_URL}/og/${icon}`] : undefined

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
