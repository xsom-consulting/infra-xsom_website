const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const root = path.resolve(__dirname, '..');

for (const file of ['index.html', 'en/index.html']) {
  test(`${file}: original hero mark links to the three unchanged practices`, () => {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const figure = html.match(/<figure\b[^>]*data-hero-mark>[\s\S]*?<\/figure>/)?.[0];
    assert.ok(figure, 'The original mark must be present in static HTML');
    assert.match(figure, /class="heritage-mark"[^>]+assets\/logo\/gradient\.svg/);
    assert.doesNotMatch(figure, /infrastructure-hero|canvas|aria-hidden="true"[^>]*<a/);
    const links = [...figure.matchAll(/<a\b[^>]+data-mark-practice="(\d)"[^>]+href="([^"]+)"[^>]*>[\s\S]*?<span>([^<]+)<\/span>/g)];
    const originalLabels = [...html.matchAll(/<h3 class="t-h3">([^<]+)<\/h3>/g)].slice(0, 3).map(match => match[1]);
    assert.equal(links.length, 3);
    assert.deepEqual(links.map(match => match[3]), originalLabels);
    for (const [, id, href] of links) {
      assert.match(figure, new RegExp(`data-mark-route="${id}"`));
      const [target, fragment] = href.split('#');
      const destination = fs.readFileSync(path.resolve(root, path.dirname(file), target), 'utf8');
      if (fragment) assert.ok(destination.includes(`id="${fragment}"`), `Missing destination ${href}`);
    }
  });
}

test('Both hero logo variants are byte-for-byte original assets', () => {
  for (const file of ['assets/logo/gradient.svg', 'assets/logo/moderne-dark.svg']) {
    const original = execFileSync('git', ['show', `a9dfd3c:${file}`], { cwd: root });
    assert.deepEqual(fs.readFileSync(path.join(root, file)), original, `${file} must not be redrawn or recoloured`);
  }
});
