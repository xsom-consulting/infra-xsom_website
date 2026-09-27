/* Live titles over a page-top film (homepage, expertise page). Every element's state is a pure function of the
   film's current time, so the words follow the shots through pauses, stalls and loops.
   Timings sit on the elements (data-in, data-dim, data-out, in seconds of the film). */
(function () {
  'use strict';
  var hero = document.querySelector('[data-home-film]');
  var layer = hero && hero.querySelector('.film-titles');
  var video = hero && hero.querySelector('.film-video');
  if (!layer || !video) return;

  var clamp = function (x) { return Math.min(1, Math.max(0, x)); };
  var outExpo = function (x) { return x >= 1 ? 1 : 1 - Math.pow(2, -10 * x); };
  var inCubic = function (x) { return x * x * x; };
  var num = function (el, key) { return Number(el.dataset[key]); };
  function enter(el, t, span) { return outExpo(clamp((t - num(el, 'in')) / span)); }
  function leave(el, t, span) { return el.dataset.out ? inCubic(clamp((t - num(el, 'out')) / span)) : 0; }
  function all(selector) { return Array.prototype.slice.call(layer.querySelectorAll(selector)); }

  var lines = all('.film-line');
  var slams = all('.film-slam');
  var rules = all('.film-rule');
  var paths = all('.film-path');
  var scrims = all('.film-scrim, .film-glow');
  var draws = all('[data-draw]');
  var heads = all('[data-head]');
  var shines = all('.film-shine');
  var veil = layer.querySelector('.film-veil');
  // Progress marks may sit outside the titles, on navigation that stays usable.
  var progress = Array.prototype.slice.call(hero.querySelectorAll('.film-progress'));
  var END = Number(layer.dataset.end) || 30;
  var looped = false;

  function renderAt(t) {
    // Tight display leading lets descenders overhang the line box: travel far enough
    // that no glyph tail lingers in the mask's padding before or after the line.
    lines.forEach(function (el) {
      el.firstElementChild.style.transform = 'translateY(' + ((1 - enter(el, t, 0.62)) * 160 - leave(el, t, 0.38) * 160) + '%)';
    });
    slams.forEach(function (el) {
      var shown = enter(el, t, 0.42);
      var exit = leave(el, t, 0.34);
      el.style.opacity = String(shown * (1 - exit));
      el.style.transform = 'translateX(' + (-exit * 60) + 'px) scale(' + (1.12 - 0.12 * shown) + ')';
      el.style.setProperty('--dim', el.dataset.dim ? String(clamp((t - num(el, 'dim')) / 0.3)) : '0');
    });
    rules.forEach(function (el) { el.style.transform = 'scaleX(' + enter(el, t, 0.55) * (1 - leave(el, t, 0.3)) + ')'; });
    paths.forEach(function (el) {
      el.style.clipPath = 'inset(-50% ' + (1 - enter(el, t, 0.9)) * 100 + '% -50% 0)';
      el.style.opacity = String(1 - leave(el, t, 0.3));
    });
    scrims.forEach(function (el) {
      el.style.opacity = String(clamp((t - num(el, 'in')) / 0.45) * (1 - leave(el, t, 0.4)));
    });
    draws.forEach(function (el) { el.style.strokeDashoffset = String(1 - clamp((t - num(el, 'in')) / 0.8)); });
    heads.forEach(function (el) {
      var shown = outExpo(clamp((t - num(el, 'in')) / 0.35));
      el.style.opacity = String(shown);
      el.style.transform = 'scale(' + (0.4 + 0.6 * shown) + ')';
    });
    shines.forEach(function (el) {
      var sweep = clamp((t - num(el, 'in')) / 1.1);
      el.style.opacity = sweep > 0 && sweep < 1 ? '1' : '0';
      el.style.backgroundPosition = (1 - sweep) * 100 + '% 0';
    });
    progress.forEach(function (el) {
      var share = clamp((t - num(el, 'in')) / (num(el, 'out') - num(el, 'in')));
      el.style.setProperty('--progress', String(share));
      el.parentElement.dataset.current = String(share > 0 && share < 1);
    });
    // Close each loop on a short fade to night; open again from it after the first pass.
    var opening = looped ? 1 - clamp(t / 0.5) : 0;
    veil.style.opacity = String(Math.max(opening, clamp((t - (END - 0.6)) / 0.6)));
  }

  // Browsers update currentTime coarsely; between updates, extrapolate from the clock.
  var frame = 0;
  var lastTime = -1;
  var lastClock = 0;
  function now() {
    var clock = performance.now();
    if (video.currentTime !== lastTime) {
      if (video.currentTime < lastTime - 1) looped = true;
      lastTime = video.currentTime;
      lastClock = clock;
      return lastTime;
    }
    return video.paused ? lastTime : Math.min(lastTime + (clock - lastClock) / 1000, lastTime + 0.25);
  }
  function tick() {
    renderAt(now());
    frame = video.paused ? 0 : requestAnimationFrame(tick);
  }
  function start() { if (!frame) frame = requestAnimationFrame(tick); }
  video.addEventListener('playing', start);
  video.addEventListener('play', start);
  video.addEventListener('pause', function () { renderAt(now()); });
  video.addEventListener('seeked', function () { renderAt(now()); });
  renderAt(0);
}());
