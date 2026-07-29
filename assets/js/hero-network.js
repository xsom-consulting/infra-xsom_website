/* ==========================================================================
   xSOM Consulting — Visualisation d'infrastructure (accueil)

   Un réseau de nœuds reliés, avec des impulsions cuivre qui circulent le long
   des arêtes. Le mouvement signifie quelque chose : le métier est
   l'infrastructure réseau.

   Le rendu est suspendu hors du viewport et quand l'onglet est masqué.
   Si `prefers-reduced-motion: reduce`, le script ne s'initialise pas et le
   rendu SVG statique reste affiché.
   ========================================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('hero-network');
  if (!canvas || !canvas.getContext) return;

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1;
  var nodes = [], edges = [], pulses = [];
  var running = false, inView = true, visible = true, rafId = null;

  var NODE_COUNT = 28;
  var LINK_DIST = 0.30;      // fraction de la largeur
  var COPPER = '226, 96, 58';
  var CORE_RADIUS = 0.19;    // zone centrale réservée au logo

  function resize() {
    var rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width;
    H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function build() {
    nodes = [];
    edges = [];
    pulses = [];

    var cx = 0.5, cy = 0.5;

    for (var i = 0; i < NODE_COUNT; i++) {
      // Distribution en anneau autour du centre, avec bruit angulaire et radial.
      var a = (i / NODE_COUNT) * Math.PI * 2 + (i % 3) * 0.28;
      var r = CORE_RADIUS + 0.06 + ((i * 37) % 100) / 100 * 0.26;
      nodes.push({
        x: cx + Math.cos(a) * r,
        y: cy + Math.sin(a) * r * 0.94,
        r: 1.6 + ((i * 13) % 100) / 100 * 1.9,
        phase: (i * 0.41) % (Math.PI * 2),
        speed: 0.6 + ((i * 7) % 100) / 100 * 0.7,
        drift: 0.0016 + ((i * 11) % 100) / 100 * 0.0022,
        driftA: a + Math.PI / 2,
        hot: i % 7 === 0
      });
    }

    // Arêtes entre voisins proches.
    for (var m = 0; m < nodes.length; m++) {
      for (var n = m + 1; n < nodes.length; n++) {
        var dx = nodes[m].x - nodes[n].x;
        var dy = nodes[m].y - nodes[n].y;
        if (Math.sqrt(dx * dx + dy * dy) < LINK_DIST) {
          edges.push({ a: m, b: n });
        }
      }
    }

    // Quelques impulsions circulant sur des arêtes choisies.
    for (var p = 0; p < Math.min(7, edges.length); p++) {
      pulses.push({
        edge: (p * 5) % edges.length,
        t: p / 7,
        speed: 0.004 + (p % 3) * 0.0016
      });
    }
  }

  function draw(time) {
    ctx.clearRect(0, 0, W, H);

    var t = time * 0.001;

    // Arêtes
    for (var e = 0; e < edges.length; e++) {
      var na = nodes[edges[e].a];
      var nb = nodes[edges[e].b];
      ctx.beginPath();
      ctx.moveTo(na.x * W, na.y * H);
      ctx.lineTo(nb.x * W, nb.y * H);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.055)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Impulsions
    for (var q = 0; q < pulses.length; q++) {
      var pulse = pulses[q];
      var edge = edges[pulse.edge];
      if (!edge) continue;
      var pa = nodes[edge.a];
      var pb = nodes[edge.b];

      pulse.t += pulse.speed;
      if (pulse.t > 1) {
        pulse.t = 0;
        pulse.edge = (pulse.edge + 3) % edges.length;
      }

      var px = (pa.x + (pb.x - pa.x) * pulse.t) * W;
      var py = (pa.y + (pb.y - pa.y) * pulse.t) * H;

      // Traînée
      var trail = Math.max(pulse.t - 0.16, 0);
      var tx = (pa.x + (pb.x - pa.x) * trail) * W;
      var ty = (pa.y + (pb.y - pa.y) * trail) * H;
      var grad = ctx.createLinearGradient(tx, ty, px, py);
      grad.addColorStop(0, 'rgba(' + COPPER + ', 0)');
      grad.addColorStop(1, 'rgba(' + COPPER + ', 0.55)');
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(px, py);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + COPPER + ', 0.9)';
      ctx.fill();
    }

    // Nœuds
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];

      // Dérive lente le long de la tangente au cercle.
      node.x += Math.cos(node.driftA + t * 0.16) * node.drift * 0.02;
      node.y += Math.sin(node.driftA + t * 0.16) * node.drift * 0.02;

      var pulseVal = 0.5 + 0.5 * Math.sin(t * node.speed + node.phase);
      var radius = node.r * (0.82 + pulseVal * 0.34);

      if (node.hot) {
        ctx.beginPath();
        ctx.arc(node.x * W, node.y * H, radius * 3.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + COPPER + ', ' + (0.05 + pulseVal * 0.07).toFixed(3) + ')';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(node.x * W, node.y * H, radius, 0, Math.PI * 2);
      ctx.fillStyle = node.hot
        ? 'rgba(' + COPPER + ', ' + (0.55 + pulseVal * 0.4).toFixed(3) + ')'
        : 'rgba(255, 255, 255, ' + (0.22 + pulseVal * 0.24).toFixed(3) + ')';
      ctx.fill();
    }
  }

  function frame(time) {
    draw(time);
    rafId = window.requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    rafId = window.requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (rafId) { window.cancelAnimationFrame(rafId); rafId = null; }
  }

  function sync() {
    if (inView && visible) start();
    else stop();
  }

  function init() {
    resize();
    if (!W) return;
    build();

    var resizeTimer;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () { resize(); build(); }, 180);
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      visible = !document.hidden;
      sync();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        sync();
      }, { threshold: 0 }).observe(canvas);
    }

    sync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
