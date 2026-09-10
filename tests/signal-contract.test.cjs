const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const origin = 'https://www.xsom.fr';
const pairs = [
  ['index.html', 'en/index.html'],
  ['expertises.html', 'en/expertise.html'],
  ['cabinet.html', 'en/firm.html'],
  ['vision.html', 'en/vision.html'],
  ['ia-souverainete.html', 'en/ai-sovereignty.html'],
  ['ai-guard.html', 'en/ai-guard.html'],
  ['carrieres.html', 'en/careers.html'],
  ['contact.html', 'en/contact.html'],
  ['mentions-legales.html', 'en/legal-notice.html'],
  ['cookies.html', 'en/cookies.html'],
];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map((match) => [match[1], match[2]]),
  );
}

function allFiles(directory) {
  return fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.')) return [];
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? allFiles(file) : [file];
  });
}

test('French and English pages retain reciprocal, canonical language URLs', () => {
  for (const [fr, en] of pairs) {
    for (const [file, language] of [[fr, 'fr'], [en, 'en']]) {
      const html = read(file);
      const links = [...html.matchAll(/<link\b[^>]*>/g)].map((match) => attributes(match[0]));
      assert.match(html, new RegExp(`<html[^>]+lang=["']${language}["']`), file);
      assert.equal(links.find((link) => link.rel === 'canonical')?.href, `${origin}/${file}`, file);
      for (const [lang, target] of [['fr', fr], ['en', en], ['x-default', fr]]) {
        assert.equal(
          links.find((link) => link.rel === 'alternate' && link.hreflang === lang)?.href,
          `${origin}/${target}`,
          `${file}: ${lang}`,
        );
      }
    }
  }
});

test('Page runtime assets are self-hosted and every stylesheet and script exists', () => {
  for (const file of [...pairs.flat(), '404.html']) {
    const html = read(file);
    const tags = [...html.matchAll(/<(?:link|script)\b[^>]*>/g)].map((match) => attributes(match[0]));
    for (const tag of tags) {
      const target = tag.src ?? (tag.rel === 'stylesheet' || tag.as === 'font' ? tag.href : undefined);
      if (!target) continue;
      const url = new URL(target, `${origin}/${file}`);
      assert.equal(url.origin, origin, `${file}: external runtime asset ${target}`);
      assert.ok(fs.existsSync(path.join(root, decodeURI(url.pathname))), `${file}: missing ${target}`);
    }
  }
});

test('Font faces ship actual WOFF2 assets without remote CSS imports', () => {
  const styles = ['assets/css', ...(fs.existsSync(path.join(root, 'design-system')) ? ['design-system'] : [])]
    .flatMap(allFiles).filter((file) => file.endsWith('.css'));
  let faces = 0;
  for (const file of styles) {
    const css = read(file).replace(/\/\*[\s\S]*?\*\//g, '');
    assert.doesNotMatch(css, /@import\s+(?:url\()?\s*["']?(?:https?:)?\/\//, file);
    for (const face of css.matchAll(/@font-face\s*\{([^}]+)\}/g)) {
      faces += 1;
      const sources = [...face[1].matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)];
      assert.ok(sources.length, `${file}: font has no local source`);
      for (const [, source] of sources) {
        assert.doesNotMatch(source, /^(?:https?:)?\/\//, file);
        assert.match(source, /\.woff2(?:\?|$)/, file);
        const asset = source.startsWith('/') ? path.join(root, source) : path.resolve(root, path.dirname(file), source);
        assert.ok(fs.existsSync(asset), `${file}: missing ${source}`);
      }
    }
  }
  assert.ok(faces >= 2, 'The brand needs its self-hosted display and technical fonts');
});

test('GitHub Pages domain, old URLs and search sitemap remain valid', () => {
  assert.equal(read('CNAME').trim(), 'www.xsom.fr');
  const redirects = {
    'expertise.html': 'expertises.html',
    'IA.html': 'ia-souverainete.html',
    'about.html': 'cabinet.html',
    'join.html': 'carrieres.html',
  };
  for (const [file, target] of Object.entries(redirects)) {
    assert.match(read(file), new RegExp(`url=${target.replace('.', '\\.')}["']`, 'i'), file);
    assert.ok(fs.existsSync(path.join(root, target)), target);
  }
  const urls = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));
  assert.ok(urls.length >= pairs.length * 2, 'Sitemap must cover both languages');
  for (const url of urls) {
    assert.equal(url.origin, origin);
    const pathname = url.pathname.endsWith('/') ? `${url.pathname}index.html` : url.pathname;
    assert.ok(fs.existsSync(path.join(root, pathname)), `Sitemap points at ${pathname}`);
  }
});

test('AI Guard links directly to the authenticated console and retains guided contact in both languages', () => {
  const consoleUrl = 'https://frontend-phi-red-47.vercel.app/home';
  for (const [file, label, contactLabel] of [
    ['ai-guard.html', 'Ouvrir la console', 'Voir la démonstration'],
    ['en/ai-guard.html', 'Open the console', 'Request a demonstration'],
  ]) {
    const links = [...read(file).matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)]
      .map(([, tag, content]) => ({ ...attributes(tag), text: content.replace(/<[^>]+>/g, '').trim() }));
    assert.ok(links.some(link => link.href === consoleUrl && link.text.startsWith(label)), `${file}: direct console link`);
    assert.ok(links.some(link => link.href === 'contact.html' && link.text.startsWith(contactLabel)), `${file}: guided demonstration contact`);
  }
});
