const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const origin = 'https://www.xsom.fr';
const pairs = [
  ['index.html', 'en/index.html'],
  ['expertises.html', 'en/expertise.html'],
  ['cabinet.html', 'en/firm.html'],
  ['ia-souverainete.html', 'en/ai-sovereignty.html'],
  ['carrieres.html', 'en/careers.html'],
  ['contact.html', 'en/contact.html'],
  ['mentions-legales.html', 'en/legal-notice.html'],
  ['cookies.html', 'en/cookies.html'],
];
const publicPages = ['', 'en'].flatMap(directory => fs.readdirSync(path.join(root, directory))
  .filter(file => file.endsWith('.html')).map(file => path.join(directory, file)));
const digest = content => createHash('sha256').update(content).digest('hex').slice(0, 12);

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
  for (const file of publicPages) {
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

test('Every public stylesheet and script uses its exact content-derived cache key', () => {
  for (const file of publicPages) {
    const tags = [...read(file).matchAll(/<(?:link|script)\b[^>]*>/g)].map(match => attributes(match[0]));
    let runtimeAssets = 0;
    for (const tag of tags) {
      const target = tag.src ?? (tag.rel === 'stylesheet' ? tag.href : undefined);
      if (!target) continue;
      const url = new URL(target, `${origin}/${file}`);
      assert.equal(url.origin, origin, `${file}: external runtime asset ${target}`);
      // URL.pathname excludes the cache query before resolving the actual local file.
      const asset = path.join(root, decodeURIComponent(url.pathname));
      const expected = digest(fs.readFileSync(asset));
      assert.equal(url.search, `?v=${expected}`, `${file}: stale or missing content hash for ${target}`);
      assert.match(url.search, /^\?v=[a-f0-9]{12}$/);
      assert.equal(url.hash, '', `${file}: runtime asset must not carry a fragment`);
      runtimeAssets += 1;
    }
    assert.ok(runtimeAssets > 0, `${file}: expected generated runtime links`);
  }
});

test('The hero stylesheet cannot reuse the pre-logo release cache key', () => {
  const asset = 'assets/css/heritage-site.css';
  // Immutable release observed in the browser cache during the original-mark fix.
  const before = execFileSync('git', ['show', `4b4ed03a3c26e4195cfb3da63c41c403dcd93ae6:${asset}`], { cwd: root });
  const after = fs.readFileSync(path.join(root, asset));
  assert.notEqual(digest(before), digest(after), 'The logo layout must differ from the old infrastructure layout');
  for (const file of ['index.html', 'en/index.html']) {
    const href = [...read(file).matchAll(/<link\b[^>]*>/g)].map(match => attributes(match[0]))
      .find(tag => tag.rel === 'stylesheet' && new URL(tag.href, `${origin}/${file}`).pathname === `/${asset}`)?.href;
    assert.ok(href, `${file}: missing hero stylesheet`);
    const current = new URL(href, `${origin}/${file}`);
    const legacy = new URL(asset, `${origin}/`);
    assert.notEqual(current.href, legacy.href, 'Do not reuse the unversioned browser cache');
    legacy.search = `?v=${digest(before)}`;
    assert.notEqual(current.href, legacy.href, 'A changed stylesheet requires a changed version URL');
    assert.equal(current.search, `?v=${digest(after)}`);
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
        const url = new URL(source, `${origin}/${file}`);
        assert.equal(url.origin, origin);
        const asset = path.join(root, decodeURIComponent(url.pathname));
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
    'vision.html': 'ia-souverainete.html',
    'en/vision.html': 'ai-sovereignty.html',
    'ai-guard.html': 'index.html',
    'en/ai-guard.html': 'index.html',
  };
  for (const [file, target] of Object.entries(redirects)) {
    assert.match(read(file), new RegExp(`url=${target.replace('.', '\\.')}["']`, 'i'), file);
    assert.ok(fs.existsSync(path.resolve(root, path.dirname(file), target)), target);
  }
  const urls = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));
  assert.ok(urls.length >= pairs.length * 2, 'Sitemap must cover both languages');
  for (const url of urls) {
    assert.equal(url.origin, origin);
    const pathname = url.pathname.endsWith('/') ? `${url.pathname}index.html` : url.pathname;
    assert.ok(fs.existsSync(path.join(root, pathname)), `Sitemap points at ${pathname}`);
  }
});

test('The corporate site contains no POC promotion, product link or indexed product page', () => {
  for (const file of publicPages) {
    const html = read(file).replace(/&nbsp;|&#160;|&#xA0;/gi, ' ');
    assert.doesNotMatch(html, /ai[\s-]*guard|frontend-phi-red-47\.vercel\.app/i, file);
  }
  for (const file of ['ai-guard.html', 'en/ai-guard.html']) {
    assert.match(read(file), /name=["']robots["'][^>]+content=["']noindex/i, file);
  }
  assert.doesNotMatch(read('sitemap.xml'), /ai-guard|vision\.html/i);
});
