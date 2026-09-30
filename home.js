// "let's get coffee" opens a small card with the email address instead of
// jumping straight to a mail app, since many people don't have one set up.
// Without JS the button is a plain mailto link.
(function () {
  var trigger = document.querySelector('.coffee');
  var card = document.getElementById('coffee-card');
  if (!trigger || !card) return;
  var copyBtn = card.querySelector('.copy');

  function isOpen() { return card.classList.contains('open'); }

  // The drawer slides and unfolds via CSS transitions on the .open class.
  function setOpen(open) {
    card.classList.toggle('open', open);
    trigger.setAttribute('aria-expanded', String(open));
    (open ? copyBtn : trigger).focus({ preventScroll: true });
  }

  trigger.addEventListener('click', function (e) {
    e.preventDefault();
    setOpen(!isOpen());
  });
  card.querySelector('.close').addEventListener('click', function () { setOpen(false); });
  card.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });

  copyBtn.addEventListener('click', function () {
    var email = copyBtn.dataset.email;
    function done() {
      copyBtn.textContent = 'copied!';
      copyBtn.classList.add('done');
      setTimeout(function () {
        copyBtn.textContent = 'copy email';
        copyBtn.classList.remove('done');
      }, 1800);
    }
    function fallback() {
      var t = document.createElement('textarea');
      t.value = email;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
      done();
    }
    if (navigator.clipboard) navigator.clipboard.writeText(email).then(done, fallback);
    else fallback();
  });
})();
