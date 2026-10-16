const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const strip = html => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

// The expertise film: one shot per practice (cyber, AI infrastructure, production),
// each carrying its practice's name and its three steps, words taken from the page.
const pages = {
  'expertises.html': {
    title: 'Réseaux. Cybersécurité. Infrastructures IA. Données.',
    practices: ['Réseaux & cybersécurité', 'Infrastructures IA & cloud HPC', 'Données & MLOps'],
    next: ['Découvrir', '#practice-map'],
    sound: 'Activer le son',
  },
  'en/expertise.html': {
    title: 'Networks. Cybersecurity. AI infrastructure. Data.',
    practices: ['Networks & cybersecurity', 'AI infrastructure & cloud HPC', 'Data & MLOps'],
    next: ['Discover', '#practice-map'],
    sound: 'Turn sound on',
  },
};

for (const [file, copy] of Object.entries(pages)) {
  const html = read(file);
  const hero = html.match(/<section class="expertise-hero"[\s\S]*?<\/section>/)[0];
  const rest = strip(html.slice(html.indexOf('</section>', html.indexOf('<section class="expertise-hero"'))));

  test(`${file}: static copy stays for search, screen readers and still states`, () => {
    assert.match(hero, /<div class="expertise-hero__copy film-static">/);
    assert.equal(strip(hero.match(/<h1[\s\S]*?<\/h1>/)[0]), copy.title);
  });

  test(`${file}: three timed beats, one per practice and per shot, in the page's own words`, () => {
    const titles = hero.slice(hero.indexOf('<div class="film-titles"'), hero.indexOf('<!-- film-bar:start'));
    assert.match(titles, /^<div class="film-titles" aria-hidden="true" data-end="18">/);
    const parts = titles.split(/<div class="film-beat /).slice(1);
    assert.equal(parts.length, 3);
    parts.forEach((beat, shot) => {
      assert.match(beat, new RegExp(`^film-beat--practice" data-shot="${shot}">`));
      const times = [...beat.matchAll(/data-(?:in|out)="([\d.]+)"/g)].map(m => Number(m[1]));
      assert.ok(times.length && times.every(t => t >= shot * 6 && t < shot * 6 + 6), `beat ${shot} stays within its shot: ${times}`);
      assert.equal(strip(beat.match(/<p class="film-line film-title"[\s\S]*?<\/p>/)[0]), copy.practices[shot]);
    });
    const pageWords = new Set(rest.toLowerCase().match(/[\p{L}\d’]+/gu));
    const filmWords = strip(titles).toLowerCase().match(/[\p{L}\d’]+/gu);
    assert.deepEqual(filmWords.filter(word => !pageWords.has(word)), []);
  });

  test(`${file}: the practice index shows each shot's progress; the bar matches the homepage`, () => {
    const index = hero.match(/<nav class="expertise-hero__index"[\s\S]*?<\/nav>/)[0];
    const progress = [...index.matchAll(/<i class="film-progress" data-in="(\d+)" data-out="(\d+)"><\/i>/g)].map(m => [Number(m[1]), Number(m[2])]);
    assert.deepEqual(progress, [[0, 6], [6, 12], [12, 18]]);
    const next = hero.match(/<a class="film-next" href="([^"]+)">\s*<span>([^<]+)<\/span>/);
    assert.deepEqual([next[2], next[1]], copy.next);
    assert.match(hero, /<button class="film-toggle" data-film-toggle /);
    assert.match(hero, new RegExp(`<button class="film-toggle film-sound" data-film-sound="off" [^>]*aria-label="${copy.sound}"`));
    assert.doesNotMatch(hero, /expertise-hero__scroll/);
  });
}

// The practice chapters: a stack from the network foundation to production, then one
// silent motion loop per practice, its poster in place and its caption naming its three acts.
for (const file of Object.keys(pages)) {
  test(`${file}: the system map stacks the practices under production, and each practice has its loop`, () => {
    const html = read(file);
    const stack = html.match(/<div class="expertise-stack"[\s\S]*?<\/p><\/div>/)[0];
    const targets = [...stack.matchAll(/<a class="expertise-stack__layer" href="#([\w-]+)">/g)].map(m => m[1]);
    assert.equal(targets.length, 3);
    targets.forEach(id => assert.match(html, new RegExp(`<article class="expertise-panel" id="${id}"`)));
    assert.match(stack, /<p class="expertise-stack__outcome">[\s\S]*<strong>Production<\/strong>/);
    assert.doesNotMatch(html, /expertise-flow|visual-frame/);
    const loops = [...html.matchAll(/<figure class="expertise-panel__visual" data-practice-loop>[\s\S]*?<\/figure>/g)].map(m => m[0]);
    assert.deepEqual(loops.map(loop => loop.match(/xsom-practice-(\w+)\.mp4/)[1]), ['network', 'compute', 'data']);
    for (const loop of loops) {
      assert.match(loop, /<div class="practice-loop" role="img" aria-label="[^"]{20,}">/);
      assert.match(loop, /<video muted loop playsinline preload="none" [^>]*data-src="[^"]+\?v=[a-f0-9]{12}"><\/video>/);
      for (const [, media] of loop.matchAll(/(?:src|data-src)="(?:\.\.\/)?(assets\/media\/[^"?]+)/g)) assert.ok(fs.existsSync(path.join(root, media)), media);
      assert.deepEqual([...loop.matchAll(/<span data-act="(\d)">/g)].map(m => m[1]), ['0', '1', '2']);
    }
    assert.match(html, /<script src="(?:\.\.\/)?assets\/js\/expertise-loops\.js\?v=[a-f0-9]{12}" defer><\/script>/);
  });
}

test('Practice loops: nine silent seconds, three acts of three', { skip: !hasFfprobe() && 'ffprobe is not installed' }, () => {
  for (const practice of ['network', 'compute', 'data']) {
    const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type', '-of', 'json', path.join(root, 'assets/media', `xsom-practice-${practice}.mp4`)], { encoding: 'utf8' }));
    assert.deepEqual(probe.streams.map(s => s.codec_type), ['video']);
    assert.ok(Math.abs(Number(probe.format.duration) - 9) < 0.1);
  }
});

test('Expertise film media: 18 seconds with its soundtrack', { skip: !hasFfprobe() && 'ffprobe is not installed' }, () => {
  for (const name of ['xsom-expertise-desktop.mp4', 'xsom-expertise-mobile.mp4']) {
    const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type', '-of', 'json', path.join(root, 'assets/media', name)], { encoding: 'utf8' }));
    assert.deepEqual(probe.streams.map(s => s.codec_type).sort(), ['audio', 'video']);
    assert.ok(Math.abs(Number(probe.format.duration) - 18) < 0.1);
  }
});

function hasFfprobe() {
  try { execFileSync('ffprobe', ['-version'], { stdio: 'ignore' }); return true; } catch { return false; }
}
