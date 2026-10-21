import { articles } from '@/content/articles'
import { thoughts } from '@/content/thoughts'
import { appList, isLaunchable } from './apps'

/** Every prerendered / sitemapped path, as catch-all segments. */
export const sitePaths: string[][] = [
  [],
  ...appList.filter((a) => isLaunchable(a.id)).map((a) => [a.id]),
  ...articles.map((a) => ['article', a.slug]),
  ...thoughts.map((t) => ['thoughts', t.slug]),
]
