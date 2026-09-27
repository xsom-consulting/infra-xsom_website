const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const strip = html => html.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const words = text => new Set(text.toLowerCase().replace(/['’]/g, ' ').match(/[\p{L}\d]+/gu));

// Films for the AI & sovereignty and careers pages (Grok clips supplied 2026-09-27):
// three shots, each carrying one idea already stated on the page.
const pages = {
  'ia-souverainete.html': { media: 'xsom-sovereignty', next: ['Découvrir', '#ai-studio'], beats: ['Sérénité', 'Sécurité', 'Souveraineté'] },
  'en/ai-sovereignty.html': { media: 'xsom-sovereignty', next: ['Discover', '#ai-studio'], beats: ['Operational confidence', 'Security', 'Sovereignty'] },
  'carrieres.html': { media: 'xsom-careers', next: ['Découvrir', '#roles'], beats: ['Missions à impact', 'Proximité avec les décideurs', 'Transmission & montée en compétence'] },
  'en/careers.html': { media: 'xsom-careers', next: ['Discover', '#roles'], beats: ['Work that matters', 'Close to decision-makers', 'Learning and passing it on'] },
};

for (const [file, page] of Object.entries(pages)) {
  const html = read(file);
  const hero = html.match(/<section class="page-film"[\s\S]*?<\/section>/)?.[0] || '';
  const body = html.slice(html.indexOf(hero) + hero.length, html.indexOf('</main>'));

  test(`${file}: the page opens on its film, with static copy for every still state`, () => {
    assert.ok(hero, 'Film hero is present');
    assert.equal(html.indexOf(hero), html.indexOf('<section', html.indexOf('<main')), 'The film is the first section');
    assert.match(hero, new RegExp(`data-desktop="(?:\\.\\./)?assets/media/${page.media}-desktop\\.mp4`));
    assert.match(hero, /<div class="page-film__copy film-static">[\s\S]*<h1 id="page-film-title">/);
  });

  test(`${file}: three beats on three shots, in the page's own words`, () => {
    const titles = hero.slice(hero.indexOf('<div class="film-titles"'), hero.indexOf('<!-- film-bar:start'));
    assert.match(titles, /^<div class="film-titles" aria-hidden="true" data-end="18">/);
    const parts = titles.split(/<div class="film-beat /).slice(1);
    assert.equal(parts.length, 3);
    parts.forEach((beat, shot) => {
      const times = [...beat.matchAll(/data-(?:in|out)="([\d.]+)"/g)].map(m => Number(m[1]));
      assert.ok(times.length && times.every(t => t >= shot * 6 && t < shot * 6 + 6), `beat ${shot} stays within its shot`);
      assert.equal(strip(beat.match(/<p class="film-line film-title"[\s\S]*?<\/p>/)[0]), page.beats[shot]);
    });
    const pageWords = words(strip(body));
    assert.deepEqual([...words(strip(titles))].filter(word => !pageWords.has(word)), [], 'Every film word is on the page below');
  });

  test(`${file}: the homepage bar, Discover leading to the first section`, () => {
    const next = hero.match(/<a class="film-next" href="([^"]+)">\s*<span>([^<]+)<\/span>/);
    assert.deepEqual([next[2], next[1]], page.next);
    assert.match(body, new RegExp(`<section [^>]*id="${page.next[1].slice(1)}"`));
    assert.match(hero, /<button class="film-toggle film-sound" data-film-sound="off" /);
  });
}

test('Page films: 18 seconds each, with sound', { skip: !hasFfprobe() && 'ffprobe is not installed' }, () => {
  for (const name of ['xsom-sovereignty', 'xsom-careers']) {
    for (const variant of ['desktop', 'mobile']) {
      const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type', '-of', 'json', path.join(root, 'assets/media', `${name}-${variant}.mp4`)], { encoding: 'utf8' }));
      assert.deepEqual(probe.streams.map(s => s.codec_type).sort(), ['audio', 'video']);
      assert.ok(Math.abs(Number(probe.format.duration) - 18) < 0.1);
    }
  }
});

function hasFfprobe() {
  try { execFileSync('ffprobe', ['-version'], { stdio: 'ignore' }); return true; } catch { return false; }
}
