'use client'

import { getDoc } from '@/content'
import type { WindowComponentProps } from '@/os/types'
import { MdxReader } from './ui/MdxReader'

/** Renders one article; the slug arrives as the window's `slug`. */
export function ArticleWindow({ slug }: WindowComponentProps) {
  return <MdxReader noun="Article" slug={slug} meta={getDoc('article', slug)} />
}
