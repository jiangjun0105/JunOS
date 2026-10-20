import { fileURLToPath } from 'node:url'
import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // .md/.mdx import as React components (articles live in src/content/articles)
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  // pin the workspace root so a stray lockfile in a parent dir isn't picked up
  outputFileTracingRoot: fileURLToPath(new URL('.', import.meta.url)),
}

// Components for MDX come from src/mdx-components.tsx. For tables/task lists, add remark-gfm to remarkPlugins.
const withMDX = createMDX({ options: { remarkPlugins: [], rehypePlugins: [] } })

export default withMDX(nextConfig)
