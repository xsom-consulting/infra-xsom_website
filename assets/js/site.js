/* ==========================================================================
   xSOM Consulting — Comportements de site
   Chargé sur toutes les pages. Aucune dépendance externe.
   ========================================================================== */
(function () {
  'use strict';

  // Signale que JS est actif. Toutes les règles CSS qui masquent un état
  // initial sont préfixées `.js` — sans script, rien n'est caché.
  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Menu mobile ------------------------------------------------------ */
  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var panel = document.getElementById('nav-panel');
    if (!toggle || !panel) return;

    var openLabel = toggle.getAttribute('data-label-open') || 'Ouvrir le menu';
    var closeLabel = toggle.getAttribute('data-label-close') || 'Fermer le menu';

    function setOpen(open) {
      panel.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? closeLabel : openLabel);
      document.body.style.overflow = open ? 'hidden' : '';
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Le panneau est un simple conteneur au-dessus de 900px : on nettoie
    // l'état si la fenêtre repasse en desktop menu ouvert.
    var wide = window.matchMedia('(min-width: 901px)');
    var onChange = function (e) { if (e.matches) setOpen(false); };
    if (wide.addEventListener) wide.addEventListener('change', onChange);
    else if (wide.addListener) wide.addListener(onChange);
  }

  /* ---- Header au défilement --------------------------------------------- */
  function initScrollHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var ticking = false;
    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---- Révélation au défilement ------------------------------------------ */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    // Sans IntersectionObserver, ou en mouvement réduit : tout est visible.
    if (!('IntersectionObserver' in window) || reduceMotion) {
      for (var i = 0; i < items.length; i++) items[i].classList.add('is-visible');
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---- Compteurs ---------------------------------------------------------
     La valeur finale est écrite dans le HTML : le script ne fait que l'animer.
     Sans JS, ou en mouvement réduit, le chiffre correct est déjà affiché.
     ------------------------------------------------------------------------ */
  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length || !('IntersectionObserver' in window) || reduceMotion) return;

    function animate(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      if (isNaN(target)) return;
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 900;
      var start = null;

      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(2, -10 * p);       // easeOutExpo
        if (p === 1) eased = 1;
        el.textContent = prefix + Math.round(target * eased) + suffix;
        if (p < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ---- Année courante ---------------------------------------------------- */
  function initYear() {
    var nodes = document.querySelectorAll('[data-year]');
    var year = String(new Date().getFullYear());
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = year;
  }

  function init() {
    initNav();
    initScrollHeader();
    initReveal();
    initCounters();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
