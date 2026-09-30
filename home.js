// "let's get coffee" opens a small card with ways to reach me instead of
// jumping straight to a mail app, since many people don't have one set up.
// Without JS the button is a plain mailto link.
(function () {
  var trigger = document.querySelector('.coffee');
  var card = document.getElementById('coffee-card');
  if (!trigger || !card) return;
  var closeBtn = card.querySelector('.close');

  function isOpen() { return card.classList.contains('open'); }

  // The drawer slides and unfolds via CSS transitions on the .open class.
  function setOpen(open) {
    card.classList.toggle('open', open);
    trigger.setAttribute('aria-expanded', String(open));
    (open ? closeBtn : trigger).focus({ preventScroll: true });
  }

  trigger.addEventListener('click', function (e) {
    e.preventDefault();
    setOpen(!isOpen());
  });
  closeBtn.addEventListener('click', function () { setOpen(false); });
  card.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });
})();
