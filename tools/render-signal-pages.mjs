#!/usr/bin/env node
/** Checked-in HTML is the copy source; this optional tool only applies design contracts.
 * --restore-original-copy explicitly recovers the approved a9dfd3c copy. No production build.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { WIDTH, HEIGHT, MISSIONS, project } from './presence-projection.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const restore = process.argv.includes('--restore-original-copy');
const pairs = [
  ['index.html', 'en/index.html'], ['expertises.html', 'en/expertise.html'],
  ['ia-souverainete.html', 'en/ai-sovereignty.html'], ['cabinet.html', 'en/firm.html'],
  ['carrieres.html', 'en/careers.html'], ['contact.html', 'en/contact.html'],
  ['mentions-legales.html', 'en/legal-notice.html'], ['cookies.html', 'en/cookies.html'],
];
const read = file => restore ? execFileSync('git', ['show', `a9dfd3c:${file}`], { cwd: root, encoding: 'utf8' }) : fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, content) => fs.writeFileSync(path.join(root, file), content.replace(/[ \t]+$/gm, '').trim() + '\n');
const filmTokens = JSON.parse(fs.readFileSync(path.join(root, 'design/home-film.tokens.json'), 'utf8'));
write('assets/css/home-film-tokens.css', `/* Generated from design/home-film.tokens.json. */\n:root {\n${Object.entries(filmTokens).map(([name, value]) => `  --${name}: ${value};`).join('\n')}\n}`);
const styles = ['design-system/fonts.css', 'assets/css/tokens.css', 'assets/css/base.css', 'assets/css/components.css', 'design-system/tokens.css', 'design-system/components.css', 'assets/css/heritage-site.css'];
// HTML can change before cached runtime files expire. Content-derived versions
// refresh only changed assets and keep repeated generation deterministic.
const assetVersions = new Map();
function runtimeAsset(file, prefix) {
  if (!assetVersions.has(file)) {
    assetVersions.set(file, createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex').slice(0, 12));
  }
  return `${prefix}${file}?v=${assetVersions.get(file)}`;
}

function heroArt(prefix, en) {
  const practices = en ? [
    ['Telecom, network &amp; cybersecurity', 'expertise.html#practice-cyber'],
    ['AI infrastructure &amp; sovereign cloud', 'ai-sovereignty.html'],
    ['Data science, ML &amp; automation', 'expertise.html#practice-data'],
  ] : [
    ['Télécom, réseau &amp; cybersécurité', 'expertises.html#pole-cyber'],
    ['Infrastructures IA &amp; cloud souverain', 'ia-souverainete.html'],
    ['Data science, ML &amp; automatisation', 'expertises.html#pole-data'],
  ];
  return `<figure class="hero__viz heritage-hero-art" data-hero-mark>
        <div class="heritage-explorer heritage-mark-map" aria-label="${en ? 'The three xSOM practices' : 'Les trois pôles xSOM'}">
          <img class="heritage-mark" src="${prefix}assets/logo/gradient.svg" width="374" height="374" fetchpriority="high" alt="${en ? 'Original xSOM logo: three interlocking blue and grey arrows.' : 'Logo original xSOM : trois flèches bleues et grise entrelacées.'}">
          <svg class="heritage-mark-routes" viewBox="0 0 600 600" fill="none" aria-hidden="true">
            <path data-mark-route="1" d="M280 157 L280 114 L320 114 L320 90"/>
            <path data-mark-route="2" d="M456 412 L504 412 L504 486"/>
            <path data-mark-route="3" d="M146 438 L96 438 L96 486"/>
            <circle cx="280" cy="157" r="5"/><circle cx="456" cy="412" r="5"/><circle cx="146" cy="438" r="5"/>
          </svg>
${practices.map(([label, href], index) => `          <a class="heritage-mark-link heritage-mark-link--${index + 1}" data-mark-practice="${index + 1}" href="${href}"><span class="heritage-mark-number" aria-hidden="true">0${index + 1}</span><span>${label}</span><span class="heritage-mark-arrow" aria-hidden="true">↗</span></a>`).join('\n')}
        </div>
      </figure>`;
}

// Lucide volume glyphs (ISC), as in the film controls of AI Guard.
const SPEAKER = 'M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z';

// The original three arrows as live SVG, drawn in turn. Each arrow is masked by the one
// that crosses over it, as in assets/logo/*.svg; the masks draw with their arrow so a
// crossing only opens once the arrow above arrives. `timing(arrow, part)` adds the
// attributes each use needs: film seconds, or a CSS delay for the offer map.
const ARROWS = [
  { key: 'a', over: 'b', path: 'M 189.39 295.00 L 365.12 295.00 L 265.88 123.11', head: '291.86 108.11 241.88 81.54 239.89 138.11', line: [189.4, 295.0, 241.9, 81.5], colors: ['#2f86ff', '#7ab8ff'] },
  { key: 'b', over: 'c', path: 'M 255.53 178.81 L 167.67 331.00 L 366.15 331.00', head: '366.15 361.00 414.15 331.00 366.15 301.00', line: [255.5, 178.8, 414.2, 331.0], colors: ['#1450c8', '#3f93ff'] },
  { key: 'c', over: 'a', path: 'M 323.08 294.19 L 235.22 142.00 L 135.97 313.89', head: '109.99 298.89 111.97 355.46 161.95 328.89', line: [323.1, 294.2, 112.0, 355.5], colors: ['#8d97a4', '#e6ebf1'] },
];
function markSvg(id, className, timing, gradients) {
  const byKey = Object.fromEntries(ARROWS.map(arrow => [arrow.key, arrow]));
  const box = 'x="74.98" y="34.18" width="374.18" height="374.18"';
  const draw = (arrow, stroke, width) => `<path data-draw${timing(arrow, 'draw')} pathLength="1" d="${arrow.path}" fill="none"${stroke ? ` stroke="${stroke}"` : ''} stroke-width="${width}" stroke-linejoin="miter"/>`;
  const head = (arrow, fill, outline = '') => `<polygon data-head${timing(arrow, 'head')} points="${arrow.head}"${fill ? ` fill="${fill}"` : ''}${outline}/>`;
  const defs = ARROWS.map(arrow => {
    const [x1, y1, x2, y2] = arrow.line;
    const over = byKey[arrow.over];
    return `<mask id="${id}-mask-${arrow.key}" maskUnits="userSpaceOnUse" ${box}><rect ${box} fill="#fff"/>${draw(over, '#000', 44)}${head(over, '#000', ' stroke="#000" stroke-width="16" stroke-linejoin="miter"')}</mask>`
      + (gradients ? `<linearGradient id="${id}-grad-${arrow.key}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${arrow.colors[0]}"/><stop offset="1" stop-color="${arrow.colors[1]}"/></linearGradient>` : '');
  }).join('');
  const paint = arrow => gradients ? `url(#${id}-grad-${arrow.key})` : '';
  const groups = ARROWS.map(arrow => `<g data-arrow="${arrow.key}" mask="url(#${id}-mask-${arrow.key})">${draw(arrow, paint(arrow), 28)}${head(arrow, paint(arrow))}</g>`).join('');
  return `<svg class="${className}" viewBox="74.98 34.18 374.18 374.18" aria-hidden="true"><defs>${defs}</defs>${groups}</svg>`;
}

// The film's closing logo, timed to the last shot (film-titles.js).
function filmEmblem() {
  const at = { a: 24.55, b: 24.85, c: 25.15 };
  const timing = (arrow, part) => ` data-in="${part === 'draw' ? at[arrow.key] : (at[arrow.key] + 0.65).toFixed(2)}"`;
  return `<div class="film-emblem">
          <span class="film-glow" data-in="24.4"></span>
          ${markSvg('film', 'film-mark', timing, true)}
          <span class="film-shine" data-in="26.4"></span>
        </div>`;
}

// The homepage offer map: the arrows draw when the section comes into view, then each
// route leads to its practice (home-page.js, home-film.css). Links work without JS.
function offerMap(en) {
  const delay = { a: 0, b: 0.3, c: 0.6 };
  const timing = (arrow, part) => ` style="--delay: ${part === 'draw' ? delay[arrow.key] : delay[arrow.key] + 0.65}s"`;
  const practices = en ? [
    ['Telecom, network &amp; cybersecurity', 'expertise.html#practice-cyber'],
    ['AI infrastructure &amp; sovereign cloud', 'ai-sovereignty.html'],
    ['Data science, ML &amp; automation', 'expertise.html#practice-data'],
  ] : [
    ['Télécom, réseau &amp; cybersécurité', 'expertises.html#pole-cyber'],
    ['Infrastructures IA &amp; cloud souverain', 'ia-souverainete.html'],
    ['Data science, ML &amp; automatisation', 'expertises.html#pole-data'],
  ];
  const routes = ['M280 157 L280 114 L320 114 L320 90', 'M456 412 L504 412 L504 486', 'M146 438 L96 438 L96 486'];
  const dots = [[280, 157], [456, 412], [146, 438]];
  return `<figure class="home-offer__map heritage-hero-art" data-hero-mark data-offer-map>
        <div class="heritage-mark-map" aria-label="${en ? 'The three xSOM practices' : 'Les trois pôles xSOM'}">
          ${markSvg('offer', 'heritage-mark offer-mark', timing, false)}
          <svg class="heritage-mark-routes" viewBox="0 0 600 600" fill="none" aria-hidden="true">
${routes.map((d, index) => `            <path data-mark-route="${index + 1}" pathLength="1" d="${d}" style="--delay: ${1.3 + index * 0.15}s"/>`).join('\n')}
            ${dots.map(([cx, cy], index) => `<circle cx="${cx}" cy="${cy}" r="5" style="--delay: ${1.2 + index * 0.15}s"/>`).join('')}
          </svg>
${practices.map(([label, href], index) => `          <a class="heritage-mark-link heritage-mark-link--${index + 1}" data-mark-practice="${index + 1}" href="${href}" style="--delay: ${1.6 + index * 0.15}s"><span class="heritage-mark-number" aria-hidden="true">0${index + 1}</span><span>${label}</span><span class="heritage-mark-arrow" aria-hidden="true">↗</span></a>`).join('\n')}
        </div>
      </figure>`;
}

// The presence map: local dotted land (build-presence-map.mjs), mission points sized
// as briefed, arcs drawn from Bordeaux. Labels are real text, positioned over the map.
function presenceMap(en) {
  const points = MISSIONS.map(mission => ({ ...mission, xy: project(mission.lon, mission.lat) }));
  const [bx, by] = points[0].xy;
  const arcs = points.slice(1).map(({ xy: [x, y] }, index) => {
    const bend = 0.22;
    const cx = (bx + x) / 2 + (y - by) * bend, cy = (by + y) / 2 - (x - bx) * bend;
    return `<path class="presence-arc" pathLength="1" d="M${bx} ${by}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x} ${y}" style="--delay: ${0.9 + index * 0.2}s"/>`;
  }).join('\n            ');
  const marks = points.map(({ city, r, xy: [x, y] }, index) => `<g class="presence-point" data-city="${city}" transform="translate(${x} ${y})" style="--delay: ${index * 0.15}s"><circle class="presence-halo" r="${r * 2}"/><circle class="presence-dot" r="${r}"/></g>`).join('\n            ');
  const labels = points.map(({ city, side, dy, fr, en: english, xy: [x, y] }) => `<li class="presence-label presence-label--${side}" data-city="${city}" style="left: ${(x / WIDTH * 100).toFixed(2)}%; top: ${(y / HEIGHT * 100).toFixed(2)}%${dy ? `; --dy: ${dy}rem` : ''}">${en ? english : fr}</li>`).join('\n          ');
  return `<figure class="presence-map" data-presence-map style="aspect-ratio: ${WIDTH} / ${HEIGHT}">
        <div class="presence-map__land" aria-hidden="true"></div>
        <svg class="presence-map__marks" viewBox="0 0 ${WIDTH} ${HEIGHT}" aria-hidden="true">
            ${arcs}
            ${marks}
        </svg>
        <ul class="presence-map__labels" aria-label="${en ? 'Mission locations' : 'Lieux de mission'}">
          ${labels}
        </ul>
      </figure>`;
}

// The three arrows, drawn in turn when their section comes into view (story.js).
const drawnMark = id => markSvg(id, 'offer-mark', (arrow, part) => ` style="--delay: ${({ a: 0, b: 0.3, c: 0.6 })[arrow.key] + (part === 'head' ? 0.65 : 0)}s"`, false);

// The bar under a page-top film, as on the AI Guard film: Discover, play, sound.
function filmBar(en, next) {
  return `    <a class="film-next" href="${next}">
      <span>${en ? 'Discover' : 'Découvrir'}</span>
      <svg class="film-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m4 9 8 7 8-7"/></svg>
    </a>
    <div class="heritage-explorer film-controls">
      <button class="film-toggle" data-film-toggle data-film-action="pause" type="button" aria-label="${en ? 'Pause video' : 'Mettre en pause'}" title="${en ? 'Pause video' : 'Mettre en pause'}" hidden>
        <svg class="film-icon film-icon--play" viewBox="0 0 24 24" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>
        <svg class="film-icon film-icon--pause" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
      </button>
      <button class="film-toggle film-sound" data-film-sound="off" type="button" aria-label="${en ? 'Turn sound on' : 'Activer le son'}" title="${en ? 'Turn sound on' : 'Activer le son'}" hidden>
        <svg class="film-icon film-icon--line film-icon--muted" viewBox="0 0 24 24" aria-hidden="true"><path d="${SPEAKER}"/><path d="m22 9-6 6M16 9l6 6"/></svg>
        <svg class="film-icon film-icon--line film-icon--sound" viewBox="0 0 24 24" aria-hidden="true"><path d="${SPEAKER}"/><path d="M16 9a5 5 0 0 1 0 6M19.364 18.364a9 9 0 0 0 0-12.728"/></svg>
      </button>
    </div>
`;
}

function homeFilm(html, prefix, en) {
  const desktop = runtimeAsset('assets/media/xsom-film-desktop.mp4', prefix);
  const mobile = runtimeAsset('assets/media/xsom-film-mobile.mp4', prefix);
  const poster = runtimeAsset('assets/media/xsom-film-desktop.jpg', prefix);
  const mobilePoster = runtimeAsset('assets/media/xsom-film-mobile.jpg', prefix);
  html = html.replace(/<section class="hero(?: home-film)?"[^>]*>[\s\S]*?<\/section>/, section => {
    section = section.replace(/<figure class="hero__viz heritage-hero-art"[\s\S]*?<\/figure>/, '');
    section = section.replace(/\s*<!-- home-film:media -->[\s\S]*?<!-- home-film:end -->/, '');
    section = section.replace(/<div class="film-emblem">[\s\S]*?<\/div>/, filmEmblem());
    return section.replace(/<section[^>]*>/, `<section class="hero home-film" data-home-film data-film-state="poster">
    <!-- home-film:media -->
    <div class="film-media" aria-hidden="true">
      <picture class="film-poster">
        <source media="(max-width: 699px)" srcset="${mobilePoster}">
        <img src="${poster}" width="1920" height="1080" fetchpriority="high" alt="">
      </picture>
      <video class="film-video" muted autoplay loop playsinline preload="none" tabindex="-1" aria-hidden="true"
        poster="${poster}" data-desktop="${desktop}" data-mobile="${mobile}"
        data-desktop-poster="${poster}" data-mobile-poster="${mobilePoster}"></video>
    </div>
${filmBar(en, `#${en ? 'offer' : 'offre'}`)}
    <!-- home-film:end -->`);
  });
  html = html.replace(/<figure class="home-offer__map[^"]*"[^>]*>[\s\S]*?<\/figure>/, offerMap(en));
  html = html.replace(/<figure class="presence-map"[^>]*>[\s\S]*?<\/figure>/, presenceMap(en));
  if (!html.includes('class="film-expertise-intro"')) {
    html = html.replace(/(<section\b[^>]*data-heritage-poles>[\s\S]*?<div class="wrap">)\s*(<div class="sec-head reveal">[\s\S]*?<\/div>)/,
      `$1\n      <div class="film-expertise-intro">\n      $2\n${heroArt(prefix, en)}\n      </div>`);
  }
  return html;
}

function decorate(file, source, pair) {
  const en = file.startsWith('en/');
  const prefix = file.endsWith('404.html') ? '/' : en ? '../' : '';
  const isHome = file === 'index.html' || file === 'en/index.html';
  const isExpertise = file === 'expertises.html' || file === 'en/expertise.html';
  const isStory = ['ia-souverainete.html', 'en/ai-sovereignty.html', 'carrieres.html', 'en/careers.html'].includes(file);
  let html = source;
  // Page-top films other than the homepage's: the marker carries Discover's target.
  const filmName = isExpertise ? 'xsom-expertise' : isStory ? (file.includes('car') ? 'xsom-careers' : 'xsom-sovereignty') : '';
  if (filmName) {
    html = html.replace(/<!-- film-bar:start ?(#[\w-]+)? -->[\s\S]*?<!-- film-bar:end -->/, (_, next = '#practice-map') => `<!-- film-bar:start ${next} -->\n${filmBar(en, next)}\n    <!-- film-bar:end -->`);
    // The AI page also carries xSOM AI Studio's footage (film/src/films.tsx, StudioLoop).
    const media = filmName === 'xsom-sovereignty' ? `${filmName}|xsom-studio` : filmName;
    html = html.replace(new RegExp(`(?:\\.\\./)?assets/media/((?:${media})-(?:desktop|mobile)\\.(?:jpg|mp4))(?:\\?v=[a-f0-9]{12})?`, 'g'),
      (_, name) => runtimeAsset(`assets/media/${name}`, prefix));
  }
  // User exception: this experimental product is not part of the corporate offer.
  html = html.replace(/\s*<section\b[^>]*aria-labelledby="guard-title"[\s\S]*?<\/section>/g, '');
  html = html.replace(/<!--[^>]*(?:NOTRE OUTIL|OUR TOOL)[\s\S]*?-->/g, '');
  html = html.replace(/<script(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/g, '');
  html = html.replace(/<link\b[^>]*\brel="(?:stylesheet|preload)"[^>]*>/g, '');
  html = html.replace(/<html\b[^>]*>/, `<html lang="${en ? 'en' : 'fr'}" data-theme="light">`);
  html = html.replace(/<body\b[^>]*>/, `<body class="heritage-site${isHome ? ' home-film-page' : ''}${isExpertise ? ' expertise-page' : ''}${isStory ? ' story-page' : ''}" data-page="${source.includes('http-equiv="refresh"') ? 'redirect' : path.basename(file, '.html')}">`);
  html = html.replace(/assets\/logo\/(?:cuivre|blanc|noir)\.svg/g, 'assets/logo/moderne-dark.svg');
  html = html.replace(/design-system\/assets\/mark\.svg/g, 'assets/logo/moderne-dark.svg');
  html = html.replace(/\sdata-split\b/g, '');
  html = html.replace(/<main id="main">/, '<main id="main" tabindex="-1">');
  html = html.replace(/<form class="form" id="contact-form"\s+novalidate/, '<form class="form" id="contact-form" method="post" action="https://api.web3forms.com/submit"');
  html = html.replace(/<div class="hero__viz">[\s\S]*?(?=\n {4}<\/div>\n {2}<\/section>)/, heroArt(prefix, en));
  html = html.replace(/<figure class="hero__viz heritage-hero-art"[\s\S]*?<\/figure>/, heroArt(prefix, en));
  if (file.endsWith('index.html')) html = html.replace(/aria-labelledby="offer-title"(?! data-heritage-poles)/, 'aria-labelledby="offer-title" data-heritage-poles');
  if (isHome) html = homeFilm(html, prefix, en);
  html = html.replace(/<div class="home-cta__mark"[^>]*>[\s\S]*?<\/div>/, `<div class="home-cta__mark" aria-hidden="true">${drawnMark('cta')}</div>`);
  html = html.replace(/<div class="story-orbit__mark"[^>]*>[\s\S]*?<\/div>/, `<div class="story-orbit__mark" aria-hidden="true">${drawnMark('orbit')}</div>`);
  if (file.endsWith('cookies.html')) {
    // Approved technical exception: never restore the obsolete remote-font claim.
    html = html.replace(/<tr>\s*<th scope="row">Google Fonts<\/th>[\s\S]*?<\/tr>/, '<tr class="heritage-privacy-update"><th scope="row">Polices locales</th><td>Les polices WOFF2 sont servies depuis ce domaine. Aucune connexion à Google Fonts ou à un CDN de polices.</td></tr>');
    if (!html.includes('data-local-preferences')) {
      const row = en
        ? '<tr class="heritage-privacy-update" data-local-preferences><th scope="row">Local preferences</th><td>Theme and reduced-motion choices are saved in your browser’s local storage. Sound starts off on each visit. No tracking identifier is stored.</td></tr>'
        : '<tr class="heritage-privacy-update" data-local-preferences><th scope="row">Préférences locales</th><td>Le thème et la réduction des animations sont mémorisés dans le stockage local de votre navigateur. Le son démarre désactivé à chaque visite. Aucun identifiant de suivi n’est stocké.</td></tr>';
      html = html.replace('</tbody>', `${row}\n</tbody>`);
    }
  }
  if (pair) {
    html = html.replace(/<link\b[^>]*(?:rel="canonical"|hreflang=)[^>]*>/g, '');
    html = html.replace('</head>', `<link rel="canonical" href="https://www.xsom.fr/${file}">\n<link rel="alternate" hreflang="fr" href="https://www.xsom.fr/${pair[0]}">\n<link rel="alternate" hreflang="en" href="https://www.xsom.fr/${pair[1]}">\n<link rel="alternate" hreflang="x-default" href="https://www.xsom.fr/${pair[0]}">\n</head>`);
  }
  const fonts = ['manrope-latin-variable', 'source-sans-3-latin-variable'].map(name => `<link rel="preload" href="${prefix}design-system/assets/${name}.woff2" as="font" type="font/woff2" crossorigin>`).join('\n');
  const pageStyles = isHome ? [...styles, 'assets/css/home-film-tokens.css', 'assets/css/film-titles.css', 'assets/css/story.css', 'assets/css/home-film.css']
    : isExpertise ? [...styles, 'assets/css/home-film-tokens.css', 'assets/css/film-titles.css', 'assets/css/expertise-story.css']
    : isStory ? [...styles, 'assets/css/home-film-tokens.css', 'assets/css/film-titles.css', 'assets/css/story.css'] : styles;
  const posterName = isHome ? 'xsom-film' : filmName;
  const posterPreloads = posterName ? ['desktop', 'mobile'].map(variant => `<link rel="preload" as="image" href="${runtimeAsset(`assets/media/${posterName}-${variant}.jpg`, prefix)}" media="(${variant === 'mobile' ? 'max-width: 699px' : 'min-width: 700px'})">`).join('\n') : '';
  html = html.replace('</head>', `${fonts}\n${posterPreloads ? `${posterPreloads}\n` : ''}${pageStyles.map(css => `<link rel="stylesheet" href="${runtimeAsset(css, prefix)}">`).join('\n')}\n<script src="${runtimeAsset('assets/js/signal-preferences-init.js', prefix)}"></script>\n</head>`);
  if (!isHome && !html.includes('<signal-preferences')) {
    const preferences = `<div class="heritage-preferences"><signal-preferences lang="${en ? 'en' : 'fr'}">${en ? 'Theme and motion respect your browser preferences.' : 'Le thème et les animations suivent les préférences de votre navigateur.'}</signal-preferences></div>`;
    html = html.includes('</footer>') ? html.replace('</footer>', `${preferences}\n</footer>`) : html.replace('</main>', `${preferences}\n</main>`);
  }
  html = html.replace('</body>', `<script src="${runtimeAsset('assets/js/heritage-site.js', prefix)}" defer></script>${isHome || filmName ? `\n<script src="${runtimeAsset('assets/js/home-film.js', prefix)}" defer></script>\n<script src="${runtimeAsset('assets/js/film-titles.js', prefix)}" defer></script>` : ''}${isHome ? `\n<script src="${runtimeAsset('assets/js/home-page.js', prefix)}" defer></script>` : ''}${isHome || isStory ? `\n<script src="${runtimeAsset('assets/js/story.js', prefix)}" defer></script>` : ''}\n<script type="module" src="${runtimeAsset('design-system/signal.js', prefix)}"></script>${file.endsWith('contact.html') ? `\n<script src="${runtimeAsset('assets/js/contact-form.js', prefix)}" defer></script>` : ''}\n</body>`);
  return html.replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, '\n\n');
}

for (const pair of pairs) for (const file of pair) write(file, decorate(file, read(file), pair));
for (const file of ['404.html', 'expertise.html', 'IA.html', 'about.html', 'join.html', 'vision.html']) write(file, decorate(file, read(file)));

function redirect(file, target) {
  const en = file.startsWith('en/');
  const base = en ? 'en/' : '';
  const html = `<!DOCTYPE html>\n<html lang="${en ? 'en' : 'fr'}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0; url=${target}"><meta name="robots" content="noindex, follow"><link rel="canonical" href="https://www.xsom.fr/${base}${target}"><title>${en ? 'Page moved' : 'Page déplacée'} — xSOM Consulting</title></head><body><main class="redirect"><h1>${en ? 'Page moved' : 'Page déplacée'}</h1><p><a class="btn btn--primary" href="${target}">${en ? 'Continue' : 'Continuer'}</a></p></main></body></html>`;
  write(file, decorate(file, html));
}
redirect('ai-guard.html', 'index.html');
redirect('en/ai-guard.html', 'index.html');
redirect('en/vision.html', 'ai-sovereignty.html');
write('en/404.html', decorate('en/404.html', fs.readFileSync(path.join(root, 'en/404.html'), 'utf8')));
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${pairs.flatMap(pair => pair.map(file => `<url><loc>https://www.xsom.fr/${file}</loc><xhtml:link rel="alternate" hreflang="fr" href="https://www.xsom.fr/${pair[0]}"/><xhtml:link rel="alternate" hreflang="en" href="https://www.xsom.fr/${pair[1]}"/><xhtml:link rel="alternate" hreflang="x-default" href="https://www.xsom.fr/${pair[0]}"/></url>`)).join('\n')}\n</urlset>`);
console.log(`${restore ? 'Restored original copy and' : 'Preserved current copy and'} rendered heritage design contracts for 16 bilingual pages and legacy redirects.`);
