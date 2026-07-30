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

  // Position du curseur en coordonnées normalisées, et intensité de l'effet
  // (montée et descente progressives quand le curseur entre et sort).
  var pointer = { x: 0, y: 0, strength: 0, target: 0 };

  var NODE_COUNT = 24;
  var LINK_DIST = 0.30;      // fraction de la largeur
  var CORE_RADIUS = 0.19;    // zone centrale réservée au logo
  var POINTER_DIST = 0.26;   // rayon d'influence du curseur

  /* Palette.

     Les nœuds reprennent les deux teintes du logo, et le cuivre est réservé à
     ce qui bouge : impulsions et lien au curseur. Le réseau se lit alors comme
     l'écosystème du signe posé en son centre, et l'accent du site reste un
     signal, pas une troisième famille de couleur. */
  var NODE   = '202, 210, 220';   // #cad2dc — flèche gris clair du logo
  var HOT    = '63, 147, 255';    // #3f93ff — flèche bleu vif du logo
  var COPPER = '226, 96, 58';     // accent du site, uniquement en mouvement

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
        // L'anneau était aplati à 0.94, ce qui n'a plus lieu d'être : la boîte
        // est carrée, l'aplatissement ne faisait que le déséquilibrer.
        y: cy + Math.sin(a) * r,
        /* Rayon plancher à 2.2 px CSS, soit 8.8 px de diamètre à l'écran en
           densité 2. En dessous d'environ 7 px, l'antialiasing ne peut plus
           décrire une courbe : le disque devient un carré flou que l'œil lit
           comme une ellipse selon sa position sous-pixel. */
        r: 2.2 + ((i * 13) % 100) / 100 * 1.8,
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
      // 5,5 % ne dessinait pas une arête mais une rayure : la structure du
      // réseau ne se lisait pas. Assez visible pour faire graphe, assez
      // discret pour rester derrière le logo.
      ctx.strokeStyle = 'rgba(' + NODE + ', 0.11)';
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
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Mise à l'échelle des nœuds, qui ont grossi : une impulsion plus fine
      // qu'eux se lirait comme une poussière plutôt que comme un signal.
      ctx.beginPath();
      ctx.arc(px, py, 2.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + COPPER + ', 0.92)';
      ctx.fill();
    }

    // Lissage de l'intensité du curseur : pas d'apparition ni de coupure nette.
    pointer.strength += (pointer.target - pointer.strength) * 0.08;

    // Nœuds
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];

      // Dérive lente le long de la tangente au cercle.
      node.x += Math.cos(node.driftA + t * 0.16) * node.drift * 0.02;
      node.y += Math.sin(node.driftA + t * 0.16) * node.drift * 0.02;

      var pulseVal = 0.5 + 0.5 * Math.sin(t * node.speed + node.phase);

      // Proximité du curseur : 1 au contact, 0 au-delà du rayon d'influence.
      var near = 0;
      if (pointer.strength > 0.01) {
        var dx = node.x - pointer.x;
        var dy = node.y - pointer.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < POINTER_DIST) {
          near = (1 - dist / POINTER_DIST) * pointer.strength;

          // Le nœud se relie au curseur, avec une opacité qui décroît.
          ctx.beginPath();
          ctx.moveTo(node.x * W, node.y * H);
          ctx.lineTo(pointer.x * W, pointer.y * H);
          ctx.strokeStyle = 'rgba(' + COPPER + ', ' + (near * 0.42).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      var radius = node.r * (0.82 + pulseVal * 0.34 + near * 0.9);

      /* Halo. Il était à 3,6 rayons pour une opacité de 5 à 12 % : trop large
         et trop faible, il rendait une bavure brune au lieu d'une lueur. Plus
         serré et un peu plus dense, il se lit comme un halo. */
      if (node.hot || near > 0.05) {
        ctx.beginPath();
        ctx.arc(node.x * W, node.y * H, radius * 2.5, 0, Math.PI * 2);
        var haloHot = node.hot ? 0.10 + pulseVal * 0.10 : 0;
        if (haloHot) {
          ctx.fillStyle = 'rgba(' + HOT + ', ' + haloHot.toFixed(3) + ')';
          ctx.fill();
        }
        if (near > 0.05) {
          ctx.beginPath();
          ctx.arc(node.x * W, node.y * H, radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + COPPER + ', ' + (near * 0.16).toFixed(3) + ')';
          ctx.fill();
        }
      }

      ctx.beginPath();
      ctx.arc(node.x * W, node.y * H, radius, 0, Math.PI * 2);
      if (node.hot) {
        ctx.fillStyle = 'rgba(' + HOT + ', ' + Math.min(1, 0.62 + pulseVal * 0.38).toFixed(3) + ')';
      } else if (near > 0.02) {
        // Le nœud vire au cuivre à l'approche du curseur : c'est l'accent du
        // site qui signale l'interaction, pas la couleur de repos du réseau.
        ctx.fillStyle = 'rgba(' + COPPER + ', ' + Math.min(1, near * 1.1).toFixed(3) + ')';
      } else {
        ctx.fillStyle = 'rgba(' + NODE + ', ' + (0.30 + pulseVal * 0.28).toFixed(3) + ')';
      }
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

    /* Le canvas doit être resynchronisé quand *l'élément* change de taille,
       pas seulement quand la fenêtre bouge : une recomposition tardive — les
       polices qui basculent, la barre d'URL d'un mobile qui se replie — change
       la boîte sans déclencher d'événement `resize`. Le tampon garderait alors
       ses anciennes dimensions et serait étiré par le CSS, ce qui déforme les
       disques en ellipses. */
    if ('ResizeObserver' in window) {
      var roTimer;
      new ResizeObserver(function () {
        window.clearTimeout(roTimer);
        roTimer = window.setTimeout(function () { resize(); build(); }, 120);
      }).observe(canvas);
    } else {
      var resizeTimer;
      window.addEventListener('resize', function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(function () { resize(); build(); }, 180);
      }, { passive: true });
    }

    document.addEventListener('visibilitychange', function () {
      visible = !document.hidden;
      sync();
    });

    // Interaction au pointeur. On écoute sur le conteneur du hero plutôt que
    // sur le canvas seul : le logo est posé par-dessus et intercepterait
    // sinon les événements au centre de la visualisation.
    var zone = canvas.closest('.hero') || canvas.parentElement;
    if (zone && window.matchMedia('(pointer: fine)').matches) {
      zone.addEventListener('pointermove', function (e) {
        var rect = canvas.getBoundingClientRect();
        if (!rect.width) return;
        pointer.x = (e.clientX - rect.left) / rect.width;
        pointer.y = (e.clientY - rect.top) / rect.height;
        // L'effet ne s'active qu'à proximité de la visualisation.
        pointer.target = (pointer.x > -0.35 && pointer.x < 1.35 &&
                          pointer.y > -0.35 && pointer.y < 1.35) ? 1 : 0;
      }, { passive: true });

      zone.addEventListener('pointerleave', function () { pointer.target = 0; }, { passive: true });
    }

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
