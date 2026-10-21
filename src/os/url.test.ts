import { describe, expect, it } from 'vitest'
import { parseWindowPath, pathForWindow, windowKey } from './url'

/**
 * Tests for the URL <-> window mapping and the window-identity key. These are
 * pure functions (no React, no router, no DOM) — see ./url — so they unit-test
 * directly. The round-trip cases pin down the deep-link contract: a path the
 * address bar shows must parse back into the same open-intent.
 */

describe('pathForWindow', () => {
  it('maps a plain app id to /<appId>', () => {
    expect(pathForWindow({ appId: 'about' })).toBe('/about')
    expect(pathForWindow({ appId: 'projects' })).toBe('/projects')
  })

  it('maps an article to /article/<slug>, url-encoding the slug', () => {
    expect(pathForWindow({ appId: 'article', slug: 'hello-world' })).toBe('/article/hello-world')
    // A slug with characters that must be percent-encoded in a path segment.
    expect(pathForWindow({ appId: 'article', slug: 'a b/c' })).toBe('/article/a%20b%2Fc')
  })

  it('falls back to /article when an article window has no slug', () => {
    // No usable slug → treated like any other app id (`/article`).
    expect(pathForWindow({ appId: 'article' })).toBe('/article')
  })
})

describe('parseWindowPath', () => {
  it('returns null for the bare desktop (root / empty)', () => {
    expect(parseWindowPath('/')).toBeNull()
    expect(parseWindowPath('')).toBeNull()
  })

  it('parses a plain app path into an app id', () => {
    expect(parseWindowPath('/about')).toEqual({ appId: 'about' })
    // Leading/trailing slashes are tolerated (empty segments are filtered out).
    expect(parseWindowPath('/projects/')).toEqual({ appId: 'projects' })
  })

  it('parses an article path into appId + decoded slug', () => {
    expect(parseWindowPath('/article/hello-world')).toEqual({
      appId: 'article',
      slug: 'hello-world',
    })
    expect(parseWindowPath('/article/a%20b%2Fc')).toEqual({ appId: 'article', slug: 'a b/c' })
  })

  it('parses /thoughts with and without a slug', () => {
    expect(parseWindowPath('/thoughts')).toEqual({ appId: 'thoughts' })
    expect(parseWindowPath('/thoughts/x')).toEqual({ appId: 'thoughts', slug: 'x' })
  })
})

describe('pathForWindow <-> parseWindowPath round-trips', () => {
  it('round-trips a plain app id', () => {
    const path = pathForWindow({ appId: 'research' })
    expect(parseWindowPath(path)).toEqual({ appId: 'research' })
  })

  it('round-trips an article slug (incl. one needing url-encoding)', () => {
    for (const slug of ['my-first-post', 'tricky slug/with bits']) {
      const path = pathForWindow({ appId: 'article', slug })
      expect(parseWindowPath(path)).toEqual({ appId: 'article', slug })
    }
  })
})

describe('windowKey', () => {
  it('is the appId when there is no slug', () => {
    expect(windowKey('about')).toBe('about/')
  })

  it('differs for different slugs', () => {
    expect(windowKey('article', 'one')).not.toBe(windowKey('article', 'two'))
  })

  it('differs for the same slug under different apps', () => {
    expect(windowKey('article', 'x')).not.toBe(windowKey('thoughts', 'x'))
  })

  it('treats a slug-less window and a same-app windowed-with-slug as distinct', () => {
    expect(windowKey('article')).not.toBe(windowKey('article', 'x'))
  })
})
