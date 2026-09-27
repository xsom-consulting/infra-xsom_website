/* Homepage below the film: the header's scroll states and the glide from Discover.
   Sections that draw themselves on arrival are story.js's. */
(function () {
  'use strict';
  var html = document.documentElement;
  function reduced() { return html.dataset.motion === 'off' || matchMedia('(prefers-reduced-motion: reduce)').matches; }

  // Header, after AI Guard: clear over the film, solid once scrolled, tucked away while
  // reading down past the film, back as soon as the visitor scrolls up.
  var header = document.querySelector('.site-header');
  var film = document.querySelector('[data-home-film]');
  if (header && film) {
    var last = window.scrollY;
    var frame = 0;
    var update = function () {
      frame = 0;
      var y = window.scrollY;
      var delta = y - last;
      last = y;
      header.dataset.solid = String(y > 24);
      if (y < film.offsetHeight * 0.8) header.dataset.hidden = 'false';
      else if (Math.abs(delta) >= 4) header.dataset.hidden = String(delta > 0);
    };
    window.addEventListener('scroll', function () { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  var next = document.querySelector('.film-next');
  if (next) {
    next.addEventListener('click', function (event) {
      var target = document.querySelector(next.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      // Land on the section itself: the header tucks away while scrolling down.
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: reduced() ? 'auto' : 'smooth' });
      history.replaceState(null, '', next.getAttribute('href'));
    });
  }
}());
