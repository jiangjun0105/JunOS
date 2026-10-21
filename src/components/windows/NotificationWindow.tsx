'use client'

import { getDoc } from '@/content'
import type { WindowComponentProps } from '@/os/types'
import { MdxReader } from './ui/MdxReader'

export function NotificationWindow({ slug }: WindowComponentProps) {
  const meta = getDoc('notification', slug)
  return <MdxReader noun="Notification" slug={slug} meta={meta} lead={meta?.summary} />
}
