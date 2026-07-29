/* ==========================================================================
   xSOM Consulting — Moteur d'animations

   Trois effets, tous conditionnés à `prefers-reduced-motion` :
     1. Révélation des grands titres ligne par ligne
     2. Parallaxe léger sur les visuels sectoriels
     3. Construction progressive des schémas techniques

   Aucune dépendance. Si le script ne s'exécute pas, tout reste visible et
   lisible : les états masqués ne sont posés qu'après vérification.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce || !('IntersectionObserver' in window)) return;

  /* ======================================================================
     1. Titres révélés ligne par ligne

     On enveloppe chaque mot dans un span, puis on calcule un délai à partir
     de sa position verticale : les mots d'une même ligne partagent le même
     offsetTop, donc le même délai. Résultat visuel : la ligne se lève d'un
     bloc, sans avoir à insérer de conteneur de ligne — ce qui casserait la
     césure naturelle du navigateur.
     ====================================================================== */

  function wrapWords(node, collected) {
    var children = Array.prototype.slice.call(node.childNodes);

    children.forEach(function (child) {
      if (child.nodeType === 3) {                        // nœud texte
        var parts = child.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();

        parts.forEach(function (part) {
          if (part === '') return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
            return;
          }
          var span = document.createElement('span');
          span.className = 'word';
          span.textContent = part;
          frag.appendChild(span);
          collected.push(span);
        });

        node.replaceChild(frag, child);
      } else if (child.nodeType === 1 && !child.classList.contains('word')) {
        // Élément inline (par exemple .em) : on descend en préservant la balise,
        // pour ne pas perdre l'italique serif de l'accent.
        wrapWords(child, collected);
      }
    });
  }

  function initSplitTitles() {
    var titles = document.querySelectorAll('[data-split]');
    if (!titles.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

    titles.forEach(function (title) {
      var words = [];
      wrapWords(title, words);
      if (!words.length) return;

      // Le regroupement par ligne se fait sur offsetTop, une fois la mise en
      // page calculée. On lit toutes les positions avant d'écrire les styles
      // pour éviter de déclencher plusieurs recalculs successifs.
      var tops = words.map(function (w) { return w.offsetTop; });
      var lines = [];
      tops.forEach(function (top) {
        if (lines.indexOf(top) === -1) lines.push(top);
      });
      lines.sort(function (a, b) { return a - b; });

      words.forEach(function (word, i) {
        word.style.transitionDelay = (lines.indexOf(tops[i]) * 65) + 'ms';
      });

      title.classList.add('split-ready');
      observer.observe(title);
    });
  }

  /* ======================================================================
     2. Parallaxe sur les visuels

     Déplacement vertical très léger (±14 px) piloté par la position de
     l'élément dans le viewport. Uniquement `transform` : aucun recalcul de
     mise en page. Lecture groupée puis écriture, dans un seul rAF.
     ====================================================================== */

  function initParallax() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    if (!items.length) return;

    var active = [];
    var ticking = false;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var i = active.indexOf(entry.target);
        if (entry.isIntersecting && i === -1) active.push(entry.target);
        else if (!entry.isIntersecting && i !== -1) active.splice(i, 1);
      });
      if (active.length) update();
    }, { rootMargin: '80px 0px' });

    items.forEach(function (el) { observer.observe(el); });

    function update() {
      var vh = window.innerHeight;
      var measured = active.map(function (el) {
        var rect = el.getBoundingClientRect();
        // -1 en haut du viewport, +1 en bas
        var progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2);
        return { el: el, y: Math.max(-1, Math.min(1, progress)) * 14 };
      });
      measured.forEach(function (m) {
        m.el.style.transform = 'translate3d(0,' + m.y.toFixed(2) + 'px,0) scale(1.08)';
      });
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking && active.length) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    window.addEventListener('resize', update, { passive: true });
  }

  /* ======================================================================
     3. Schémas techniques

     Les tracés portent une longueur de pointillé égale à leur longueur
     réelle : en passant l'offset de cette longueur à zéro, le trait se
     dessine. Les étages du schéma s'allument ensuite dans l'ordre.
     ====================================================================== */

  function initDiagrams() {
    var diagrams = document.querySelectorAll('[data-diagram]');
    if (!diagrams.length) return;

    diagrams.forEach(function (svg) {
      var paths = svg.querySelectorAll('.dg-draw');
      paths.forEach(function (p) {
        var len = 0;
        try { len = p.getTotalLength(); } catch (e) { return; }
        if (!len) return;
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
      });
      svg.classList.add('dg-ready');
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-drawn');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.3 });

    diagrams.forEach(function (svg) { observer.observe(svg); });
  }

  function init() {
    initSplitTitles();
    initParallax();
    initDiagrams();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
