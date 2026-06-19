# bryceglacken.com

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

- `index.html` — home page
- `photography.html` → `/photography/` — photo gallery
- `ceramics.html` → `/ceramics/` — ceramics gallery
- `style.css` — all styles (shared across pages)
- `images/` — photos (committed to the repo)

## Adding photos to a gallery

1. Resize to ~2000px wide before committing (keeps the repo lean):
   ```bash
   sips --resampleWidth 2000 /path/to/photo.jpg --out images/photo-N.jpg
   ```
2. Add an `<img>` to the `.photo-grid` in the relevant page:
   ```html
   <img src="/images/photo-N.jpg" alt="" loading="lazy">
   ```

Panoramas (aspect ratio wider than 2:1) automatically span the full row.
