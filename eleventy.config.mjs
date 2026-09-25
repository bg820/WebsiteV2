import Image from "@11ty/eleventy-img";

// Gallery photos are resized at build time: the grid downloads thumbnail-sized
// files, and the lightbox picks a full-size one from the same srcset.
const PHOTO_WIDTHS = [480, 800, 1200, 1600, "auto"];

// Row heights gallery.js aims for at each breakpoint (keep in sync with
// targetHeight() there). Used to estimate each photo's display width for
// browsers that don't support sizes="auto".
const ROW_HEIGHT = { phone: 260, tablet: 340, desktop: 400 };

// Photos in the first row load eagerly; the rest wait until scrolled near.
const EAGER_COUNT = 3;

function escapeAttr(s) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

async function galleryItem(line, i, count) {
  const [file, alt = ""] = line.split("|").map((s) => s.trim());
  const meta = await Image(`images/${file}`, {
    widths: PHOTO_WIDTHS,
    formats: ["webp"],
    outputDir: "_site/img/",
    urlPath: "/img/",
    fixOrientation: true,
  });
  const variants = meta.webp; // ascending by width
  const full = variants[variants.length - 1];
  const fallback = variants.find((v) => v.width >= 800) || full;
  const r = full.width / full.height;

  // Rows scale up a little to fill the width, hence the 15% headroom.
  const est = (h) => `${Math.round(h * r * 1.15)}px`;
  const sizes = [
    i < EAGER_COUNT ? null : "auto",
    `(max-width: 599px) ${r >= 1 ? "100vw" : est(ROW_HEIGHT.phone)}`,
    `(max-width: 999px) ${est(ROW_HEIGHT.tablet)}`,
    est(ROW_HEIGHT.desktop),
  ].filter(Boolean).join(", ");

  const label = alt ? "" : ` aria-label="View photo ${i + 1} of ${count}"`;
  const loading = i < EAGER_COUNT ? "" : ` loading="lazy"`;

  return `<a href="${full.url}" style="--r: ${r.toFixed(3)}"${label}>` +
    `<img src="${fallback.url}" srcset="${variants.map((v) => v.srcset).join(", ")}" ` +
    `sizes="${sizes}" width="${full.width}" height="${full.height}" ` +
    `alt="${escapeAttr(alt)}"${loading} decoding="async"></a>`;
}

export default function (eleventyConfig) {
  for (const path of [
    "style.css",
    "images",
    "favicon.svg",
    "gallery.js",
    "robots.txt",
    "sitemap.xml",
    "_headers",
  ]) {
    eleventyConfig.addPassthroughCopy(path);
  }

  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));

  // Full-page background photo: preloads a WebP version (~60% smaller than the
  // JPEG) and swaps it in via image-set(), keeping the JPEG in style.css as the
  // fallback for browsers without image-set() type() support.
  eleventyConfig.addShortcode("heroBackground", async function (file) {
    const meta = await Image(`images/${file}`, {
      widths: ["auto"],
      formats: ["webp"],
      outputDir: "_site/img/",
      urlPath: "/img/",
      fixOrientation: true,
    });
    const url = meta.webp[0].url;
    return `<link rel="preload" as="image" href="${url}" type="image/webp">\n` +
      `  <style>body.home { background-image: image-set(url("${url}") type("image/webp"), url("/images/${file}") type("image/jpeg")); }</style>`;
  });

  // {% gallery %} … {% endgallery %} — one photo per line, as a filename in
  // images/, optionally followed by " | alt text". Aspect ratios are read from
  // the files themselves.
  eleventyConfig.addPairedShortcode("gallery", async function (content) {
    const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
    const items = await Promise.all(
      lines.map((line, i) => galleryItem(line, i, lines.length)),
    );
    return `<div class="photo-grid">\n${items.join("\n")}\n</div>`;
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
    },
    htmlTemplateEngine: "njk",
  };
}
