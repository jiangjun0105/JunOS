'use client'

import { getArticle } from '@/content/articles'
import type { WindowComponentProps } from '@/os/types'
import { MdxReader } from './ui/MdxReader'

/** Renders one article; the slug arrives via the window's `params`. */
export function ArticleWindow({ params }: WindowComponentProps) {
  const slug = typeof params?.slug === 'string' ? params.slug : undefined
  return <MdxReader noun="Article" slug={slug} meta={slug ? getArticle(slug) : undefined} />
}
