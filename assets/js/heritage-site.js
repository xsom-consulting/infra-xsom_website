/* Corporate progressive enhancement. All editorial text remains in the HTML. */
(function () {
  'use strict';
  var html = document.documentElement;
  var en = html.lang === 'en';
  var reduced = function () { return html.dataset.motion === 'off' || matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var menu = document.querySelector('[data-nav-toggle]');
  var nav = document.getElementById('nav-panel');
  function setMenu(open, focus) {
    if (!menu || !nav) return;
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', menu.getAttribute(open ? 'data-label-close' : 'data-label-open'));
    nav.classList.toggle('is-open', open);
    if (focus) menu.focus();
  }
  if (menu && nav) {
    menu.addEventListener('click', function () { setMenu(menu.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') setMenu(false, true); });
    document.addEventListener('click', function (event) { if (!event.target.closest('.site-header')) setMenu(false); });
    nav.addEventListener('click', function (event) { if (event.target.closest('a')) setMenu(false); });
    matchMedia('(min-width: 1101px)').addEventListener('change', function () { setMenu(false); });
  }
  function syncBrands() {
    document.querySelectorAll('.brand img, .heritage-mark').forEach(function (img) {
      img.src = img.src.replace(/(?:gradient|moderne-dark)\.svg$/, html.dataset.theme === 'dark' ? 'moderne-dark.svg' : 'gradient.svg');
    });
  }
  syncBrands();
  window.addEventListener('signal-preference', syncBrands);
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  document.querySelectorAll('[data-since]').forEach(function (el) { el.textContent = String(new Date().getFullYear() - Number(el.dataset.since)) + (el.dataset.suffix || ''); });

  // Real links work without JS. Focus/hover connects one practice to its original arrow.
  document.querySelectorAll('[data-hero-mark]').forEach(function (art) {
    function syncFocus() {
      var link = art.querySelector('[data-mark-practice]:focus') || art.querySelector('[data-mark-practice]:hover');
      art.dataset.focus = link ? link.dataset.markPractice : '';
    }
    art.querySelectorAll('[data-mark-practice]').forEach(function (link) {
      ['pointerenter', 'pointerleave', 'focus', 'blur'].forEach(function (event) { link.addEventListener(event, syncFocus); });
    });
  });

  // Connected practice selector. Existing anchors and their complete copy stay visible.
  document.querySelectorAll('[data-heritage-poles]').forEach(function (section) {
    var grid = section.querySelector('.grid');
    var cards = Array.from(grid.querySelectorAll(':scope > .card'));
    var map = document.createElement('div');
    map.className = 'heritage-explorer heritage-pole-map';
    map.setAttribute('aria-label', en ? 'Explore our practices' : 'Explorer nos pôles');
    cards.forEach(function (card, index) {
      card.id = 'heritage-practice-' + index;
      if (index) { var connector = document.createElement('span'); connector.setAttribute('aria-hidden', 'true'); map.appendChild(connector); }
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = card.querySelector('h3').textContent;
      button.setAttribute('aria-controls', card.id);
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', function () {
        var active = button.getAttribute('aria-pressed') !== 'true';
        map.querySelectorAll('button').forEach(function (item) { item.setAttribute('aria-pressed', String(active && item === button)); });
        cards.forEach(function (item) { item.classList.toggle('is-selected', active && item === card); });
        map.classList.remove('is-routing');
        if (!reduced()) requestAnimationFrame(function () { map.classList.add('is-routing'); });
      });
      map.appendChild(button);
    });
    map.addEventListener('animationend', function () { map.classList.remove('is-routing'); });
    grid.before(map);
  });

  // Existing sovereignty diagrams become keyboard-readable layer selectors.
  document.querySelectorAll('svg[data-diagram]').forEach(function (svg, diagramIndex) {
    var groups = Array.from(svg.querySelectorAll(':scope > g')).filter(function (group) { return group.querySelector('.dg-text'); });
    if (groups.length < 2) return;
    var controls = document.createElement('div');
    controls.className = 'heritage-explorer heritage-diagram-controls';
    controls.setAttribute('aria-label', en ? 'Explore the diagram' : 'Explorer le schéma');
    groups.forEach(function (group, index) {
      group.dataset.diagramItem = String(index);
      group.id = 'heritage-diagram-' + diagramIndex + '-' + index;
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = group.querySelector('.dg-text').textContent;
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-controls', group.id);
      button.addEventListener('click', function () {
        var active = button.getAttribute('aria-pressed') !== 'true';
        controls.querySelectorAll('button').forEach(function (item) { item.setAttribute('aria-pressed', String(active && item === button)); });
        svg.classList.toggle('is-filtered', active);
        groups.forEach(function (item) { item.classList.toggle('is-selected', item === group); });
        if (active) {
          var box = group.getBBox();
          var ratio = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
          svg.parentElement.scrollTo({ left: Math.max(0, (box.x + box.width / 2) * ratio - svg.parentElement.clientWidth / 2), behavior: reduced() ? 'instant' : 'smooth' });
        }
      });
      controls.appendChild(button);
    });
    // Keep buttons outside the scrollable drawing so they remain available on mobile.
    svg.parentElement.after(controls);
  });
}());
