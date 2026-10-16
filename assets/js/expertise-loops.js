/* Practice loops on the expertise pages (film/src/practices.tsx): silent nine-second motion
   designs in three acts of three seconds. The poster stays in place for reduced motion, no
   JavaScript and failed playback; the video loads only once its panel nears the screen, plays
   only while visible, and lights the caption of the act on screen. */
(function () {
  'use strict';
  var ACT = 3;
  var motion = matchMedia('(prefers-reduced-motion: reduce)');
  var figures = [].slice.call(document.querySelectorAll('[data-practice-loop]'));
  if (!figures.length) return;
  function reduced() { return motion.matches || document.documentElement.dataset.motion === 'off'; }

  var loops = figures.map(function (figure) {
    var video = figure.querySelector('video');
    var acts = [].slice.call(figure.querySelectorAll('[data-act]'));
    var loop = { figure: figure, video: video, visible: false };
    function mark(index) {
      acts.forEach(function (act, i) {
        if (i === index) act.setAttribute('data-current', 'true');
        else act.removeAttribute('data-current');
      });
    }
    loop.sync = function () {
      if (reduced() || !loop.visible || document.hidden || figure.dataset.loopState === 'failed') {
        video.pause();
        if (reduced()) { figure.dataset.loopState = 'still'; mark(-1); }
        return;
      }
      if (!video.getAttribute('src')) video.src = video.dataset.src;
      var playing = video.play();
      if (playing && playing.catch) playing.catch(function () { figure.dataset.loopState = 'failed'; mark(-1); });
    };
    video.addEventListener('playing', function () { figure.dataset.loopState = 'playing'; });
    video.addEventListener('error', function () { figure.dataset.loopState = 'failed'; mark(-1); });
    video.addEventListener('timeupdate', function () { mark(Math.min(acts.length - 1, Math.floor(video.currentTime / ACT))); });
    return loop;
  });

  function syncAll() { loops.forEach(function (loop) { loop.sync(); }); }
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        loops.forEach(function (loop) {
          if (loop.figure === entry.target) { loop.visible = entry.isIntersecting; loop.sync(); }
        });
      });
    }, { rootMargin: '120px 0px' });
    loops.forEach(function (loop) { observer.observe(loop.figure); });
  } else {
    loops.forEach(function (loop) { loop.visible = true; });
    syncAll();
  }
  document.addEventListener('visibilitychange', syncAll);
  if (motion.addEventListener) motion.addEventListener('change', syncAll);
  new MutationObserver(syncAll).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
})();
