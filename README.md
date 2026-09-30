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
- `_includes/gallery.njk` — gallery page layout (title, back link, lightbox)
- `_includes/ribbon.svg.njk` — the silver ribbon drawn on award stubs
- `index.html` — home page layout
- `_data/home.json` — everything the home page says (see below)
- `home.js` — the "let's get coffee" card
- `photography.html` → `/photography/` — photo gallery
- `ceramics.html` → `/ceramics/` — ceramics gallery
- `style.css` — all styles (shared across pages)
- `gallery.js` — justified row layout + lightbox
- `images/` — original photos (committed to the repo)
- `images/cutouts/` — the pots and logo with transparent backgrounds
- `_headers` — Cloudflare Pages cache headers

## Editing the home page

The words and pictures live in `_data/home.json`:

- `currently` — the sticky note.
- `interests` — the ticked list. `"sub": true` indents an item under the one
  above it; `note` is the small grey aside.
- `shelf` — pots on the shelf, left to right. `scale` is height relative to the
  tall vases (1 = vase height, 0.5 = half). `"books": true` stands a piece on
  two little books; `"optional": true` hides it on phones.
- `prints` — the four taped-up photos (filenames in `images/`).
- `events` — the ticket stubs, numbered in order. `color` is `yolk`, `cobalt`,
  `glory`, or `olive`. Add `"stamp": "Volun-<br>teer"` for an ink stamp or
  `"ribbon": "2nd"` for a silver ribbon.

New shelf pieces need a transparent PNG in `images/cutouts/`. On a Mac,
long-press a subject in Photos or Preview and choose "Copy Subject" to cut one
out.

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
