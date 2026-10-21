import { articles, type ArticleKind, type DocMeta } from './articles'
import { notifications } from './notifications'
import { thoughts } from './thoughts'

const indexes: Record<string, (DocMeta & { kind?: ArticleKind })[]> = {
  article: articles,
  thoughts,
  notification: notifications,
}

/** One document's metadata by window app id + slug; undefined for other apps or unknown slugs. */
export function getDoc(
  appId: string,
  slug?: string,
): (DocMeta & { kind?: ArticleKind }) | undefined {
  return slug ? indexes[appId]?.find((d) => d.slug === slug) : undefined
}
