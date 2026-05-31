import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Let .md / .mdx files be imported as React components (articles live in
  // src/content/articles). Including them here also means a stray .mdx in app/
  // would render as a page — we don't do that, but it's the standard recipe.
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
}

// Wires up the MDX loader. Custom components + element "skins" are provided
// globally by src/mdx-components.tsx (the App Router convention), so articles
// can use <Figure>, <Video>, <Embed> with no per-file imports.
// To add GitHub-flavored markdown (tables, task lists), install `remark-gfm`
// and add it to options.remarkPlugins below.
const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)
