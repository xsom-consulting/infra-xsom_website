#!/usr/bin/env node
/** Checked-in HTML is the copy source; this optional tool only applies design contracts.
 * --restore-original-copy explicitly recovers the approved a9dfd3c copy. No production build.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

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

function homeFilm(html, prefix, en) {
  const desktop = runtimeAsset('assets/media/xsom-film-desktop.mp4', prefix);
  const mobile = runtimeAsset('assets/media/xsom-film-mobile.mp4', prefix);
  const poster = runtimeAsset('assets/media/xsom-film-desktop.jpg', prefix);
  const mobilePoster = runtimeAsset('assets/media/xsom-film-mobile.jpg', prefix);
  html = html.replace(/<section class="hero(?: home-film)?"[^>]*>[\s\S]*?<\/section>/, section => {
    section = section.replace(/<figure class="hero__viz heritage-hero-art"[\s\S]*?<\/figure>/, '');
    section = section.replace(/\s*<!-- home-film:media -->[\s\S]*?<!-- home-film:end -->/, '');
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
    <div class="heritage-explorer film-controls">
      <button class="film-toggle" data-film-toggle type="button" hidden>${en ? 'Play video' : 'Lire la vidéo'}</button>
    </div>
    <!-- home-film:end -->`);
  });
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
  let html = source;
  // User exception: this experimental product is not part of the corporate offer.
  html = html.replace(/\s*<section\b[^>]*aria-labelledby="guard-title"[\s\S]*?<\/section>/g, '');
  html = html.replace(/<!--[^>]*(?:NOTRE OUTIL|OUR TOOL)[\s\S]*?-->/g, '');
  html = html.replace(/<script(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/g, '');
  html = html.replace(/<link\b[^>]*\brel="(?:stylesheet|preload)"[^>]*>/g, '');
  html = html.replace(/<html\b[^>]*>/, `<html lang="${en ? 'en' : 'fr'}" data-theme="light">`);
  html = html.replace(/<body\b[^>]*>/, `<body class="heritage-site${isHome ? ' home-film-page' : ''}" data-page="${source.includes('http-equiv="refresh"') ? 'redirect' : path.basename(file, '.html')}">`);
  html = html.replace(/assets\/logo\/(?:cuivre|blanc|noir)\.svg/g, 'assets/logo/moderne-dark.svg');
  html = html.replace(/design-system\/assets\/mark\.svg/g, 'assets/logo/moderne-dark.svg');
  html = html.replace(/\sdata-split\b/g, '');
  html = html.replace(/<main id="main">/, '<main id="main" tabindex="-1">');
  html = html.replace(/<form class="form" id="contact-form"\s+novalidate/, '<form class="form" id="contact-form" method="post" action="https://api.web3forms.com/submit"');
  html = html.replace(/<div class="hero__viz">[\s\S]*?(?=\n {4}<\/div>\n {2}<\/section>)/, heroArt(prefix, en));
  html = html.replace(/<figure class="hero__viz heritage-hero-art"[\s\S]*?<\/figure>/, heroArt(prefix, en));
  if (file.endsWith('index.html')) html = html.replace(/aria-labelledby="offer-title"(?! data-heritage-poles)/, 'aria-labelledby="offer-title" data-heritage-poles');
  if (isHome) html = homeFilm(html, prefix, en);
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
  const pageStyles = isHome ? [...styles, 'assets/css/home-film-tokens.css', 'assets/css/home-film.css'] : styles;
  const posterPreloads = isHome ? ['desktop', 'mobile'].map(variant => `<link rel="preload" as="image" href="${runtimeAsset(`assets/media/xsom-film-${variant}.jpg`, prefix)}" media="(${variant === 'mobile' ? 'max-width: 699px' : 'min-width: 700px'})">`).join('\n') : '';
  html = html.replace('</head>', `${fonts}\n${posterPreloads ? `${posterPreloads}\n` : ''}${pageStyles.map(css => `<link rel="stylesheet" href="${runtimeAsset(css, prefix)}">`).join('\n')}\n<script src="${runtimeAsset('assets/js/signal-preferences-init.js', prefix)}"></script>\n</head>`);
  if (!html.includes('<signal-preferences')) {
    const preferences = `<div class="heritage-preferences"><signal-preferences lang="${en ? 'en' : 'fr'}">${en ? 'Theme and motion respect your browser preferences.' : 'Le thème et les animations suivent les préférences de votre navigateur.'}</signal-preferences></div>`;
    html = html.includes('</footer>') ? html.replace('</footer>', `${preferences}\n</footer>`) : html.replace('</main>', `${preferences}\n</main>`);
  }
  html = html.replace('</body>', `<script src="${runtimeAsset('assets/js/heritage-site.js', prefix)}" defer></script>${isHome ? `\n<script src="${runtimeAsset('assets/js/home-film.js', prefix)}" defer></script>` : ''}\n<script type="module" src="${runtimeAsset('design-system/signal.js', prefix)}"></script>${file.endsWith('contact.html') ? `\n<script src="${runtimeAsset('assets/js/contact-form.js', prefix)}" defer></script>` : ''}\n</body>`);
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
