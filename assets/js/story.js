/* Schemas that draw themselves once, on arrival: the homepage offer map, cards, mission
   map and closing logo, and the schemas of the AI & sovereignty and careers pages.
   Without JavaScript or with reduced motion everything is simply shown (story.css). */
(function () {
  'use strict';
  var html = document.documentElement;
  if (!('IntersectionObserver' in window)) return;
  if (html.dataset.motion === 'off' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.dataset.play = 'done';
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('[data-reveal], [data-offer-map], .offer-cards, [data-presence-map], .home-cta').forEach(function (part) {
    // Already in view at load: shown as is, no replay.
    if (part.getBoundingClientRect().top < innerHeight * 0.7) return;
    part.dataset.play = 'ready';
    observer.observe(part);
  });
}());
