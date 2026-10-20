# /public/media

Article media lives here, one folder per article slug. Anything under `/public` is
served from the site root, so `public/media/my-slug/diagram.png` is referenced as:

```mdx
![A diagram](/media/my-slug/diagram.png)
<Gallery columns={3} items={[{ src: '/media/my-slug/a.jpg', caption: '…' }]} />
```

Keep files reasonably sized; they're committed to the repo and served statically.
For long-form video, link to YouTube/Vimeo rather than committing the file.
