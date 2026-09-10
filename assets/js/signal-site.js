/* Lightweight corporate behavior; shared mechanisms live in design-system/signal.js. */
(function () {
  'use strict';
  var html = document.documentElement;
  var menu = document.querySelector('[data-menu]');
  var nav = document.getElementById('signal-navigation');
  var english = html.lang === 'en';
  var reduced = function () { return html.dataset.motion === 'off' || window.matchMedia('(prefers-reduced-motion: reduce)').matches; };

  function setMenu(open, focus) {
    if (!menu || !nav) return;
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', english ? (open ? 'Close menu' : 'Open menu') : (open ? 'Fermer le menu' : 'Ouvrir le menu'));
    nav.classList.toggle('is-open', open);
    if (focus) menu.focus();
  }
  if (menu) {
    menu.addEventListener('click', function () { setMenu(menu.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') setMenu(false, true); });
    document.addEventListener('click', function (event) { if (!event.target.closest('.signal-header')) setMenu(false); });
    window.matchMedia('(min-width: 1101px)').addEventListener('change', function () { setMenu(false); });
  }

  var pending = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced()) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.remove('is-pending'); observer.unobserve(entry.target); } });
    }, { threshold: 0.12 });
    pending.forEach(function (element) { element.classList.add('is-pending'); observer.observe(element); });
  }
  window.addEventListener('signal-preference', function () { if (reduced()) pending.forEach(function (element) { element.classList.remove('is-pending'); }); });

  var progress = document.querySelector('.signal-reading-progress');
  var scheduled = false;
  function updateProgress() {
    scheduled = false;
    var available = html.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = 'scaleX(' + (available > 0 ? Math.min(1, Math.max(0, window.scrollY / available)) : 0) + ')';
  }
  window.addEventListener('scroll', function () { if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); } }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
  document.querySelectorAll('[data-year]').forEach(function (element) { element.textContent = String(new Date().getFullYear()); });

  // A restrained CTA attraction. Never applied to form submission or operational controls.
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.site-actions .btn, .site-closing .btn').forEach(function (button) {
      button.addEventListener('pointermove', function (event) {
        if (reduced()) return;
        var box = button.getBoundingClientRect();
        button.style.translate = ((event.clientX - box.left - box.width / 2) * 0.025) + 'px ' + ((event.clientY - box.top - box.height / 2) * 0.025) + 'px';
      });
      button.addEventListener('pointerleave', function () { button.style.translate = ''; });
    });
  }
}());
