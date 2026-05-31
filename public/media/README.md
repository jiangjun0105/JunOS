# /public/media

Article media lives here, one folder per article slug:

```
public/media/
  field-notes-on-attention/
    diagram.png
    demo.mp4
  building-junos/
    ...
```

Anything under `/public` is served from the site root, so a file at
`public/media/my-slug/diagram.png` is referenced in an article as:

```mdx
<Figure src="/media/my-slug/diagram.png" alt="…" caption="…" />
<Video  src="/media/my-slug/demo.mp4" caption="…" />
```

## Images

Drop them in and reference them with `<Figure>` (captioned) or `<Gallery>` (grid).
Plain Markdown `![alt](/media/...)` works too. Keep them reasonably sized — they're
committed to the repo and served statically.

## Video

- **Short clips you own** → put the file here and use `<Video src="/media/.../clip.mp4" />`.
  Good for a few small files; large videos bloat the repo, so keep these short.
- **Long-form video** → don't host it here. Use `<Embed src="https://youtu.be/…" />`
  to stream it from YouTube/Vimeo (free CDN, nothing committed to the repo).

If you outgrow `/public` (many or large files), move media to Vercel Blob and point
the same `src` props at the Blob URLs — no other code changes needed.
