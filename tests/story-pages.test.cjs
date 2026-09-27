const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const strip = html => html.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, '’').replace(/\s+/g, ' ').trim();
const words = text => new Set(text.toLowerCase().replace(/['’]/g, ' ').match(/[\p{L}\d]+/gu));
// The approved copy these pages were cut from (before the 2026-09-27 rewrite).
// Diagram labels count: they were SVG text on the original pages.
const original = file => strip(execFileSync('git', ['show', `30588d5:${file}`], { cwd: root, encoding: 'utf8' }).replace(/<\/?svg\b[^>]*>/g, ' '));
// Words the user gave elsewhere on the site: the homepage mission map (Careers), the
// shared closing call to action (“Nous suivre sur LinkedIn”) and the requested term “Cloud HPC”.
const siteFacts = ['afrique', 'océan', 'indien', 'africa', 'indian', 'ocean', 'the', 'suivre', 'follow', 'hpc'];

const pages = {
  'ia-souverainete.html': { kind: 'ai', linkedin: true },
  'en/ai-sovereignty.html': { kind: 'ai', linkedin: true },
  'carrieres.html': { kind: 'careers', mail: 'mailto:jean-philippe.talou@xsom.fr' },
  'en/careers.html': { kind: 'careers', mail: 'mailto:jean-philippe.talou@xsom.fr' },
};

for (const [file, page] of Object.entries(pages)) {
  const html = read(file);
  const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
  // The page head keeps its current copy until its film arrives.
  const body = main.slice(main.indexOf('</section>') + '</section>'.length);

  test(`${file}: the body is cut from the page's own copy, no stock phrases`, () => {
    const allowed = words(original(file));
    const extra = [...words(strip(body))].filter(word => !allowed.has(word) && !siteFacts.includes(word));
    assert.deepEqual(extra, [], 'Every word comes from the original page');
    assert.doesNotMatch(body, /laisserez une trace|leave a mark|Pas des avantages|Not perks|Le constat|The problem/);
    for (const paragraph of body.match(/<p\b[\s\S]*?<\/p>/g) || []) {
      assert.ok(strip(paragraph).split(' ').length <= 14, `One short line per paragraph: ${strip(paragraph)}`);
    }
  });

  test(`${file}: the page is understood from its schemas`, () => {
    const reveal = [...body.matchAll(/data-reveal/g)].length;
    assert.ok(reveal >= 3, 'At least three animated schemas or groups');
    const cta = body.match(/<section class="home-cta"[\s\S]*?<\/section>/)[0];
    assert.match(cta, /href="https:\/\/www\.linkedin\.com\/company\/xsom-consulting" target="_blank" rel="noopener"/);
    if (page.kind === 'ai') {
      const layers = [...body.matchAll(/<li class="story-stack__layer" data-layer="(\d)"/g)].map(m => Number(m[1]));
      assert.deepEqual(layers, [4, 3, 2, 1], 'Four layers, drawn from the ground up');
      assert.equal([...body.matchAll(/<li class="story-flow__node"/g)].length, 4);
      assert.equal([...body.matchAll(/<li class="story-card"/g)].length, 3);
      assert.match(cta, /href="contact.html"/);
    } else {
      assert.equal([...body.matchAll(/<li class="story-tile"/g)].length, 6);
      assert.equal([...body.matchAll(/<li class="story-orbit__item"/g)].length, 8);
      assert.equal([...body.matchAll(/<li class="story-steps__step"/g)].length, 4);
      assert.ok(body.includes(`href="${page.mail}`), 'Applications still go to the same address');
    }
  });
}
