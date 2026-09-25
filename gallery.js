// Justified gallery layout + lightbox (shared by photography & ceramics pages).
// Each photo link carries its aspect ratio inline as --r (= width / height), so
// the layout runs immediately without waiting for images to load.
(function () {
  var GAP = 3;
  var grid = document.querySelector('.photo-grid');
  if (!grid) return;
  var items = [].slice.call(grid.children);

  function ratio(el) {
    return parseFloat(el.style.getPropertyValue('--r')) || 1.5;
  }

  // Target row height — larger on wider screens. Every row lands near this
  // height, so photos read as visually consistent sizes. Keep in sync with
  // ROW_HEIGHT in eleventy.config.mjs.
  function targetHeight() {
    var w = window.innerWidth;
    if (w < 600) return 260;
    if (w < 1000) return 340;
    return 400;
  }

  var lastW = 0;
  function layout() {
    // Floor the true (possibly fractional) width: clientWidth rounds, and
    // rounding up makes full rows overflow by a sub-pixel and wrap.
    var W = Math.floor(grid.getBoundingClientRect().width);
    if (W === lastW) return;
    lastW = W;
    var H = targetHeight();
    var row = [], sumR = 0;

    function render(els, h, fill) {
      var avail = W - (els.length - 1) * GAP;
      var rh = Math.round(h);
      var used = 0;
      els.forEach(function (el, i) {
        var w = Math.round(h * ratio(el));
        // On width-filling rows, let the last photo absorb rounding so the row
        // ends flush with the container edge (no sliver gap).
        if (fill && i === els.length - 1) w = avail - used;
        used += w;
        el.style.width = w + 'px';
        el.style.height = rh + 'px';
      });
    }

    items.forEach(function (el) {
      row.push(el);
      sumR += ratio(el);
      if (sumR * H + (row.length - 1) * GAP >= W) {
        // Row is full. Decide whether to keep this photo here (scaled down) or
        // push it to the next row (previous photos scaled up) — whichever lands
        // closer to the target height keeps rows looking even.
        var hKeep = (W - (row.length - 1) * GAP) / sumR;
        var breakBefore = false;
        if (row.length > 1) {
          var sumPrev = sumR - ratio(el);
          var hPrev = (W - (row.length - 2) * GAP) / sumPrev;
          breakBefore = Math.abs(hPrev - H) <= Math.abs(hKeep - H);
        }
        if (breakBefore) {
          var last = row.pop();
          sumR -= ratio(last);
          render(row, (W - (row.length - 1) * GAP) / sumR, true);
          row = [last];
          sumR = ratio(last);
        } else {
          render(row, hKeep, true);
          row = [];
          sumR = 0;
        }
      }
    });
    // Last row: stretch it to fill the width like the others, so it reaches the
    // edge with no trailing gap. Cap the height at 1.5x the target so a lone
    // leftover photo grows a bit but never balloons (then it sits left-aligned).
    if (row.length) {
      var lastH = (W - (row.length - 1) * GAP) / sumR;
      if (lastH <= H * 1.5) {
        render(row, lastH, true);
      } else {
        render(row, H * 1.5, false);
      }
    }
  }

  layout();
  // Catches window resizes and anything else that changes the grid's width
  // (scrollbars appearing, zoom).
  new ResizeObserver(layout).observe(grid);

  // ── Lightbox ──
  var lb = document.getElementById('lightbox');
  if (!lb || !lb.showModal) return; // no <dialog> support: links open the image
  var lbImg = lb.querySelector('img');
  var current = 0;

  function thumb(i) {
    return items[(i + items.length) % items.length].querySelector('img');
  }

  function show(i) {
    current = (i + items.length) % items.length;
    var t = thumb(current);
    // Show the already-loaded thumbnail instantly, then swap in a full-size
    // version from the same srcset — the browser keeps the thumbnail on screen
    // until the larger file arrives.
    lbImg.removeAttribute('srcset');
    if (t.currentSrc) lbImg.src = t.currentSrc;
    lbImg.alt = t.alt;
    requestAnimationFrame(function () {
      lbImg.sizes = '100vw';
      lbImg.srcset = t.srcset;
    });
    preload(current + 1);
    preload(current - 1);
  }

  function preload(i) {
    var p = new Image();
    p.sizes = '100vw';
    p.srcset = thumb(i).srcset;
  }

  items.forEach(function (el, i) {
    el.addEventListener('click', function (e) {
      // Leave modified clicks alone so "open in new tab" still works.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      show(i);
      lb.showModal();
    });
  });

  lb.addEventListener('click', function () { lb.close(); });

  document.addEventListener('keydown', function (e) {
    if (!lb.open) return;
    if (e.key === 'ArrowRight') show(current + 1);
    else if (e.key === 'ArrowLeft') show(current - 1);
  });

  // Swipe left/right on touch screens to move between photos.
  var x0 = null, y0 = 0;
  lb.addEventListener('touchstart', function (e) {
    x0 = e.touches[0].clientX;
    y0 = e.touches[0].clientY;
  }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    var dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault(); // a swipe shouldn't also count as a tap-to-close
      show(current + (dx < 0 ? 1 : -1));
    }
  });
})();
