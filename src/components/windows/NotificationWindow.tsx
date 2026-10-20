'use client'

import { getNotification } from '@/content/notifications'
import type { WindowComponentProps } from '@/os/types'
import { MdxReader } from './ui/MdxReader'

export function NotificationWindow({ params }: WindowComponentProps) {
  const slug = typeof params?.slug === 'string' ? params.slug : undefined
  const meta = slug ? getNotification(slug) : undefined
  return <MdxReader noun="Notification" slug={slug} meta={meta} lead={meta?.summary} />
}
