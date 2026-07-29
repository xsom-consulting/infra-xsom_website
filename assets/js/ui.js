/* ==========================================================================
   xSOM Consulting — Micro-interactions

   Ce qui fait qu'une interface paraît soignée tient à peu de choses : un
   retour visuel au bon endroit, une transition qui suit le geste, un repère
   de progression. Rien ici ne doit détourner l'attention du contenu.

     1. Halo cuivre qui suit le curseur sur les cartes
     2. Indicateur de navigation qui glisse entre les liens
     3. Attraction légère des boutons principaux
     4. Barre de progression de lecture
     5. Retour en haut

   Tout est conditionné à `prefers-reduced-motion` et à un pointeur fin :
   les effets de survol n'ont pas de sens au doigt.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia &&
    window.matchMedia('(pointer: fine)').matches;

  /* ======================================================================
     1. Halo qui suit le curseur

     Deux variables CSS suffisent : le dégradé radial est déclaré dans la
     feuille de style, on ne fait que déplacer son centre.
     ====================================================================== */
  function initSpotlight() {
    if (reduce || !finePointer) return;

    var targets = document.querySelectorAll('.card, .diagram-wrap, .notice');
    if (!targets.length) return;

    targets.forEach(function (el) {
      el.classList.add('has-spotlight');

      var pending = false;
      var lastX = 0, lastY = 0;

      el.addEventListener('pointermove', function (e) {
        var rect = el.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
        if (pending) return;
        pending = true;
        window.requestAnimationFrame(function () {
          el.style.setProperty('--mx', lastX + 'px');
          el.style.setProperty('--my', lastY + 'px');
          pending = false;
        });
      }, { passive: true });
    });
  }

  /* ======================================================================
     2. Indicateur de navigation

     Une barre unique glisse sous le lien survolé, et revient sur la page
     courante quand le curseur quitte la navigation. Plus lisible qu'un
     soulignement qui apparaît et disparaît sous chaque lien.
     ====================================================================== */
  function initNavIndicator() {
    var nav = document.querySelector('.site-header .nav');
    if (!nav || reduce) return;
    if (!window.matchMedia('(min-width: 901px)').matches) return;

    var current = nav.querySelector('a[aria-current="page"]');
    var bar = document.createElement('span');
    bar.className = 'nav__indicator';
    bar.setAttribute('aria-hidden', 'true');
    nav.appendChild(bar);
    // Signale au CSS de retirer le soulignement par lien : l'indicateur le remplace.
    nav.classList.add('has-indicator');

    function moveTo(link, animate) {
      if (!link) { bar.style.opacity = '0'; return; }
      var navRect = nav.getBoundingClientRect();
      var rect = link.getBoundingClientRect();
      bar.style.transitionDuration = animate ? '' : '0ms';
      bar.style.opacity = '1';
      bar.style.width = rect.width + 'px';
      bar.style.transform = 'translateX(' + (rect.left - navRect.left) + 'px)';
      if (!animate) {
        // Rétablit la durée au cycle suivant, sinon le premier survol saute.
        window.requestAnimationFrame(function () { bar.style.transitionDuration = ''; });
      }
    }

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('pointerenter', function () { moveTo(link, true); });
      link.addEventListener('focus', function () { moveTo(link, true); });
    });

    nav.addEventListener('pointerleave', function () { moveTo(current, true); });
    nav.addEventListener('focusout', function (e) {
      if (!nav.contains(e.relatedTarget)) moveTo(current, true);
    });

    window.addEventListener('resize', function () { moveTo(current, false); }, { passive: true });

    // Position initiale posée après le chargement des polices : la largeur des
    // liens change quand Inter remplace la police de repli.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { moveTo(current, false); });
    } else {
      moveTo(current, false);
    }
  }

  /* ======================================================================
     3. Attraction des boutons principaux

     Le bouton se décale de quelques pixels vers le curseur. L'amplitude est
     volontairement faible : passé 6 px, l'effet devient un gadget et la
     cible devient difficile à cliquer.
     ====================================================================== */
  function initMagnetic() {
    if (reduce || !finePointer) return;

    var buttons = document.querySelectorAll('.btn--primary');
    if (!buttons.length) return;

    var MAX = 5;

    buttons.forEach(function (btn) {
      var pending = false;
      var dx = 0, dy = 0;

      btn.addEventListener('pointermove', function (e) {
        var rect = btn.getBoundingClientRect();
        dx = ((e.clientX - rect.left) / rect.width - 0.5) * 2 * MAX;
        dy = ((e.clientY - rect.top) / rect.height - 0.5) * 2 * MAX;
        if (pending) return;
        pending = true;
        window.requestAnimationFrame(function () {
          btn.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
          pending = false;
        });
      }, { passive: true });

      btn.addEventListener('pointerleave', function () {
        btn.style.transform = '';
      }, { passive: true });
    });
  }

  /* ======================================================================
     4. Progression de lecture
     ====================================================================== */
  function initProgress() {
    var main = document.getElementById('main');
    if (!main) return;

    var bar = document.createElement('div');
    bar.className = 'read-progress';
    bar.setAttribute('aria-hidden', 'true');
    var fill = document.createElement('span');
    bar.appendChild(fill);
    document.body.appendChild(bar);

    var ticking = false;
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      fill.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  /* ======================================================================
     5. Retour en haut
     ====================================================================== */
  function initBackToTop() {
    var label = document.documentElement.lang === 'en' ? 'Back to top' : 'Revenir en haut';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'to-top';
    btn.setAttribute('aria-label', label);
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2.2" aria-hidden="true">' +
      '<path d="M12 19V5M5 12l7-7 7 7"/></svg>';

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      var skip = document.querySelector('.skip-link');
      if (skip) skip.focus();
    });

    document.body.appendChild(btn);

    var ticking = false;
    function update() {
      btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  function init() {
    initSpotlight();
    initNavIndicator();
    initMagnetic();
    initProgress();
    initBackToTop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
