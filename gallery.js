// Justified gallery layout + lightbox (shared by photography & ceramics pages).
// Each <img> carries its aspect ratio inline as --r (= width / height), so the
// layout runs immediately without waiting for images to load.
(function () {
  var GAP = 3;
  var grid = document.querySelector('.photo-grid');

  function ratio(img) {
    return parseFloat(img.style.getPropertyValue('--r')) || 1.5;
  }

  // Target row height — larger on wider screens. Every row lands near this
  // height, so photos read as visually consistent sizes.
  function targetHeight() {
    var w = window.innerWidth;
    if (w < 600) return 260;
    if (w < 1000) return 340;
    return 400;
  }

  function layout() {
    if (!grid) return;
    var W = grid.clientWidth;
    var H = targetHeight();
    var imgs = [].slice.call(grid.querySelectorAll('img'));
    var row = [], sumR = 0;

    function render(items, h, fill) {
      var avail = W - (items.length - 1) * GAP;
      var rh = Math.round(h);
      var used = 0;
      items.forEach(function (img, i) {
        var w = Math.round(h * ratio(img));
        // On width-filling rows, let the last photo absorb rounding so the row
        // ends flush with the container edge (no sliver gap).
        if (fill && i === items.length - 1) w = avail - used;
        used += w;
        img.style.width = w + 'px';
        img.style.height = rh + 'px';
      });
    }

    imgs.forEach(function (img) {
      row.push(img);
      sumR += ratio(img);
      if (sumR * H + (row.length - 1) * GAP >= W) {
        // Row is full. Decide whether to keep this photo here (scaled down) or
        // push it to the next row (previous photos scaled up) — whichever lands
        // closer to the target height keeps rows looking even.
        var hKeep = (W - (row.length - 1) * GAP) / sumR;
        var breakBefore = false;
        if (row.length > 1) {
          var sumPrev = sumR - ratio(img);
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

  if (grid) {
    layout();
    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(layout, 150);
    });
    window.addEventListener('load', layout);
  }

  // ── Lightbox ──
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img');
    document.querySelectorAll('.photo-grid img').forEach(function (img) {
      img.addEventListener('click', function () {
        lbImg.src = img.src;
        lb.classList.add('open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });
    function closeLb() {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    lb.addEventListener('click', closeLb);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLb();
    });
  }
})();
