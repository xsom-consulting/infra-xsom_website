/* First paint only. The shared runtime owns subsequent preference changes. */
(function () {
  'use strict';
  var html = document.documentElement;
  html.classList.add('signal-js');
  html.dataset.theme = 'light';
  try {
    var saved = JSON.parse(localStorage.getItem('xsom-signal-preferences') || '{}');
    if (saved.theme === 'light' || saved.theme === 'dark') html.dataset.theme = saved.theme;
    if (saved.reduced === true || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      html.dataset.reducedMotion = 'true';
      html.dataset.motion = 'off';
    }
  } catch (_) { /* Storage can be disabled without preventing access to the site. */ }
}());
