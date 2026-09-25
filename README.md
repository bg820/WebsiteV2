# br.gl

Personal website — built with [Eleventy](https://www.11ty.dev/), deployed on Cloudflare Pages.

## Develop locally

```bash
npm install      # first time only
npm start        # dev server with live reload at http://localhost:8765
```

## Build

```bash
npm run build    # outputs the static site to _site/
```

## Deploy

Pushing to `main` auto-deploys via Cloudflare Pages.
Build command: `npm run build` · Output directory: `_site`

## Project layout

- `_includes/base.njk` — shared page shell (head, meta tags, fonts, footer)
- `_includes/gallery.njk` — gallery page layout (nav, heading, lightbox)
- `index.html` — home page
- `photography.html` → `/photography/` — photo gallery
- `ceramics.html` → `/ceramics/` — ceramics gallery
- `style.css` — all styles (shared across pages)
- `gallery.js` — justified row layout + lightbox
- `images/` — original photos (committed to the repo)
- `_headers` — Cloudflare Pages cache headers

## Adding photos to a gallery

1. Resize to ~2000px wide before committing (keeps the repo lean):
   ```bash
   sips --resampleWidth 2000 /path/to/photo.jpg --out images/photo-N.jpg
   ```
2. Add the filename on its own line inside the `{% gallery %}` block of the
   relevant page, in the position you want it to appear. Alt text is optional,
   after a `|`:
   ```
   photo-N.jpg | Fog rolling over a ridgeline at dawn
   ```

At build time each photo is resized into several WebP widths (into `/img/`),
so the grid downloads small files and the lightbox downloads large ones.
Aspect ratios are read from the files. The gallery uses a justified row layout:
photos fill each row's width with no gaps and no cropping, and wide panoramas
naturally take up more of their row. In the lightbox, arrow keys or swiping
move between photos.
