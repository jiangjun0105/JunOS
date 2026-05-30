import { Desktop } from '@/os/Desktop'

/** The home route IS the desktop. Windows are layered on top of it by OSRoot. */
export default function Home() {
  return <Desktop />
}
