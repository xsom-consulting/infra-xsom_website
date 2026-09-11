/* Decorative film: the first-paint poster and all editorial content are static HTML. */
(function () {
  'use strict';
  var hero = document.querySelector('[data-home-film]');
  if (!hero) return;
  var video = hero.querySelector('video');
  var toggle = hero.querySelector('[data-film-toggle]');
  var en = document.documentElement.lang === 'en';
  var motion = matchMedia('(prefers-reduced-motion: reduce)');
  var portrait = matchMedia('(max-width: 699px)');
  var userPaused = false;
  var failed = false;
  var inView = true;
  var pending = false;
  var loaded = false;
  function reduced() {
    return motion.matches || document.documentElement.dataset.motion === 'off';
  }
  function allowed() { return !reduced() && !userPaused && !failed && inView && !document.hidden; }
  function label() {
    var action = video.paused ? 'play' : 'pause';
    var text = action === 'play' ? (en ? 'Play video' : 'Lire la vidéo') : (en ? 'Pause video' : 'Mettre en pause');
    toggle.dataset.filmAction = action;
    toggle.setAttribute('aria-label', text);
    toggle.title = text;
  }
  function sync() {
    toggle.hidden = reduced();
    if (!allowed()) {
      video.pause();
      hero.dataset.filmState = reduced() || failed || !loaded ? 'poster' : 'paused';
      label();
      return;
    }
    var source = portrait.matches ? video.dataset.mobile : video.dataset.desktop;
    if (video.getAttribute('src') !== source) {
      video.src = source;
      video.poster = portrait.matches ? video.dataset.mobilePoster : video.dataset.desktopPoster;
      video.muted = true;
      loaded = false;
      hero.dataset.filmState = 'loading';
    }
    if (pending || !video.paused) return;
    pending = true;
    video.play().then(function () {
      pending = false;
      if (!allowed()) { sync(); return; }
      loaded = true;
      hero.dataset.filmState = 'playing';
      label();
    }).catch(function () {
      pending = false;
      // A visibility or preference change may interrupt play without a media error.
      if (!allowed()) { sync(); return; }
      failed = true;
      hero.dataset.filmState = 'poster';
      label();
    });
  }
  toggle.addEventListener('click', function () {
    if (reduced()) return;
    userPaused = !video.paused;
    if (failed) { video.removeAttribute('src'); failed = false; }
    sync();
  });
  video.addEventListener('error', function () { failed = true; sync(); });
  window.addEventListener('signal-preference', sync);
  motion.addEventListener('change', sync);
  portrait.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { inView = entries[0].isIntersecting; sync(); }, { threshold: 0 }).observe(hero);
  }
  // The navigation sits on the dark film in both site themes.
  function headerBrand() {
    var mark = document.querySelector('.site-header .brand img');
    if (mark) mark.src = mark.src.replace(/gradient\.svg$/, 'moderne-dark.svg');
  }
  headerBrand();
  window.addEventListener('signal-preference', headerBrand);
  sync();
}());
