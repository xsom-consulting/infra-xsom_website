/* Decorative film: the first-paint poster and all editorial content are static HTML.
   `still` means the film will not play (reduced motion, failure, pause before the first
   frame, or a slow start): the page then shows its static copy instead of live titles. */
(function () {
  'use strict';
  var hero = document.querySelector('[data-home-film]');
  if (!hero) return;
  var video = hero.querySelector('video');
  var toggle = hero.querySelector('[data-film-toggle]');
  var sound = hero.querySelector('[data-film-sound]');
  var en = document.documentElement.lang === 'en';
  var motion = matchMedia('(prefers-reduced-motion: reduce)');
  var portrait = matchMedia('(max-width: 699px)');
  var userPaused = false;
  var failed = false;
  var inView = true;
  var pending = false;
  var loaded = false;
  var slow = false;
  var slowTimer = 0;
  var SLOW_START = 3000;
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
    if (!sound) return;
    var on = !video.muted;
    var soundText = on ? (en ? 'Turn sound off' : 'Couper le son') : (en ? 'Turn sound on' : 'Activer le son');
    sound.dataset.filmSound = on ? 'on' : 'off';
    sound.setAttribute('aria-label', soundText);
    sound.title = soundText;
  }
  function still() { return reduced() || failed || slow || (userPaused && !loaded); }
  function sync() {
    toggle.hidden = reduced();
    if (sound) sound.hidden = reduced();
    if (!allowed()) {
      video.pause();
      hero.dataset.filmState = still() ? 'still' : loaded ? 'paused' : 'poster';
      label();
      return;
    }
    var source = portrait.matches ? video.dataset.mobile : video.dataset.desktop;
    if (video.getAttribute('src') !== source) {
      var muted = video.muted;
      video.src = source;
      video.poster = portrait.matches ? video.dataset.mobilePoster : video.dataset.desktopPoster;
      video.muted = muted;
      loaded = false;
      hero.dataset.filmState = slow ? 'still' : 'loading';
      clearTimeout(slowTimer);
      slowTimer = setTimeout(function () {
        if (loaded) return;
        slow = true;
        hero.dataset.filmState = 'still';
      }, SLOW_START);
    }
    if (pending || !video.paused) return;
    pending = true;
    video.play().then(function () {
      pending = false;
      if (!allowed()) { sync(); return; }
      loaded = true;
      slow = false;
      clearTimeout(slowTimer);
      hero.dataset.filmState = 'playing';
      label();
    }).catch(function () {
      pending = false;
      // A visibility or preference change may interrupt play without a media error.
      if (!allowed()) { sync(); return; }
      failed = true;
      hero.dataset.filmState = 'still';
      label();
    });
  }
  toggle.addEventListener('click', function () {
    if (reduced()) return;
    userPaused = !video.paused;
    if (failed) { video.removeAttribute('src'); failed = false; }
    sync();
  });
  if (sound) {
    // Sound starts off on every visit. Turning it on also resumes a paused film.
    sound.addEventListener('click', function () {
      if (reduced()) return;
      video.muted = !video.muted;
      if (!video.muted && video.paused) {
        userPaused = false;
        if (failed) { video.removeAttribute('src'); failed = false; }
      }
      sync();
      label();
    });
  }
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
