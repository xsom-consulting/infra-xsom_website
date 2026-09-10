const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
// The user's original copy, before the Signal redesign. Never regenerate this
// reference from the current tree: that would bless the very drift we detect.
const baseline = 'a9dfd3ca33875f1b0e68a13dd9c15e4ff00ec7c3';
const pages = [
  'index.html', 'expertises.html', 'cabinet.html', 'ia-souverainete.html',
  'carrieres.html', 'contact.html', 'mentions-legales.html', 'cookies.html',
  'en/index.html', 'en/expertise.html', 'en/firm.html', 'en/ai-sovereignty.html',
  'en/careers.html', 'en/contact.html', 'en/legal-notice.html', 'en/cookies.html',
];
const voidTags = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const blockTags = new Set('address article aside blockquote br dd div dl dt fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 header hr li main nav ol p section table tbody td th thead tr ul'.split(' '));

function decode(text) {
  const entities = { amp: '&', nbsp: ' ', quot: '"', apos: "'", lt: '<', gt: '>' };
  return text.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (original, name) => {
    if (name.startsWith('#')) return String.fromCodePoint(Number.parseInt(name.slice(name[1].toLowerCase() === 'x' ? 2 : 1), name[1].toLowerCase() === 'x' ? 16 : 10));
    assert.ok(name in entities, `Add the explicit HTML entity ${original} to the copy decoder`);
    return entities[name];
  });
}

function normalize(text) {
  return decode(text).replace(/\s+/gu, ' ').trim();
}

// A small tree reader for the checked-in, explicit HTML. Scripts/styles are
// removed before tokenizing; quoted attribute values can contain angle brackets.
function parse(html) {
  const document = { tag: 'document', attributes: {}, children: [] };
  const stack = [document];
  const source = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  const tokens = source.match(/<!--[\s\S]*?-->|<![^>]*>|<\/?[a-z][^>"']*(?:(?:"[^"]*"|'[^']*')[^>"']*)*>|[^<]+/gi) || [];
  for (const token of tokens) {
    if (token.startsWith('<!')) continue;
    if (token.startsWith('</')) {
      const tag = token.match(/^<\/([\w-]+)/)[1].toLowerCase();
      const index = stack.findLastIndex(node => node.tag === tag);
      if (index > 0) stack.length = index;
    } else if (token.startsWith('<')) {
      const tag = token.match(/^<([\w-]+)/)[1].toLowerCase();
      const attributes = Object.fromEntries([...token.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(([, key, value]) => [key, value]));
      const node = { tag, attributes, children: [] };
      stack.at(-1).children.push(node);
      if (!voidTags.has(tag) && !token.endsWith('/>')) stack.push(node);
    } else stack.at(-1).children.push(token);
  }
  return document;
}

function find(node, predicate, omit = () => false) {
  return typeof node === 'string' || omit(node) ? [] : [ ...(predicate(node) ? [node] : []), ...node.children.flatMap(child => find(child, predicate, omit)) ];
}

function text(node, omit = () => false) {
  if (typeof node === 'string') return node;
  if (omit(node) || ['svg', 'canvas'].includes(node.tag)) return '';
  const content = node.children.map(child => text(child, omit)).join('');
  return blockTags.has(node.tag) ? ` ${content} ` : content;
}

function exclusions(file, isBaseline) {
  return node => {
    if (node.tag === 'section' && node.attributes['aria-labelledby'] === 'guard-title') {
      assert.ok(['ia-souverainete.html', 'en/ai-sovereignty.html'].includes(file));
      return true; // Explicitly authorized removal of the whole POC promotion.
    }
    const classes = (node.attributes.class || '').split(/\s+/);
    if (classes.includes('heritage-explorer')) {
      assert.notEqual(node.tag, 'main');
      return true; // New visual controls; never the editorial source container.
    }
    if (classes.includes('heritage-privacy-update')) {
      assert.ok(['cookies.html', 'en/cookies.html'].includes(file));
      assert.equal(node.tag, 'tr');
      return true; // Approved technical disclosure only, not marketing copy.
    }
    return isBaseline && file === 'cookies.html' && node.tag === 'tr'
      && normalize(text(node)).startsWith('Google Fonts ');
  };
}

for (const file of pages) {
  test(`${file}: original editorial copy is unchanged outside named exceptions`, () => {
    const original = execFileSync('git', ['show', `${baseline}:${file}`], { cwd: root, encoding: 'utf8' });
    const current = fs.readFileSync(path.join(root, file), 'utf8');
    const mainBefore = find(parse(original), node => node.tag === 'main');
    const mainAfter = find(parse(current), node => node.tag === 'main');
    assert.equal(mainBefore.length, 1, 'Original main is missing');
    assert.equal(mainAfter.length, 1, 'Restored main is missing or duplicated');
    const before = normalize(text(mainBefore[0], exclusions(file, true)));
    const after = normalize(text(mainAfter[0], exclusions(file, false)));
    assert.ok(before.length > 300, 'Non-vacuous original copy must be read');
    let mismatch = 0;
    while (mismatch < before.length && before[mismatch] === after[mismatch]) mismatch += 1;
    assert.ok(after === before, `${file}: editorial wording, ordering or services changed at character ${mismatch}\nExpected: ${before.slice(Math.max(0, mismatch - 50), mismatch + 130)}\nReceived: ${after.slice(Math.max(0, mismatch - 50), mismatch + 130)}`);
    const headings = (main, omitted) => find(main, node => /^h[1-6]$/.test(node.tag), omitted)
      .map(node => `${node.tag}: ${normalize(text(node, omitted))}`).filter(line => !line.endsWith(': '));
    assert.deepEqual(headings(mainAfter[0], exclusions(file, false)), headings(mainBefore[0], exclusions(file, true)), `${file}: original heading hierarchy changed`);
  });
}

test('The copy comparison preserves inline words and cannot hide a rewritten paragraph', () => {
  const original = parse('<main><h1>Conseil <span>indépendant</span></h1><p>Du cadrage à la production.</p></main>');
  const changed = parse('<main><h1>Conseil <span>indépendant</span></h1><p>Une nouvelle promesse.</p></main>');
  assert.equal(normalize(text(original)), 'Conseil indépendant Du cadrage à la production.');
  assert.notEqual(normalize(text(original)), normalize(text(changed)));
  assert.equal(normalize(text(parse('<main><p>Réseau &amp; IA&nbsp;souveraine</p><svg><title>Décor</title></svg></main>'))), 'Réseau & IA souveraine');
});

test('Approved privacy corrections are present and limited to the three technical rows', () => {
  const expected = {
    'cookies.html': [
      'Polices locales Les polices WOFF2 sont servies depuis ce domaine. Aucune connexion à Google Fonts ou à un CDN de polices.',
      'Préférences locales Le thème et la réduction des animations sont mémorisés dans le stockage local de votre navigateur. Le son démarre désactivé à chaque visite. Aucun identifiant de suivi n’est stocké.',
    ],
    'en/cookies.html': [
      'Local preferences Theme and reduced-motion choices are saved in your browser’s local storage. Sound starts off on each visit. No tracking identifier is stored.',
    ],
  };
  for (const [file, rows] of Object.entries(expected)) {
    const document = parse(fs.readFileSync(path.join(root, file), 'utf8'));
    const corrections = find(document, node => (node.attributes.class || '').split(/\s+/).includes('heritage-privacy-update'));
    assert.ok(corrections.every(node => node.tag === 'tr'), `${file}: exception outside a table row`);
    assert.deepEqual(corrections.map(node => normalize(text(node))), rows, `${file}: privacy exception changed or vanished`);
  }
});
