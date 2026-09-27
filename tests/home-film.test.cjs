const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const strip = html => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const hero = html => html.match(/<section class="hero home-film"[\s\S]*?<\/section>/)[0];
const between = (html, start, end) => html.slice(html.indexOf(start), html.indexOf(end, html.indexOf(start)));

// The user's brief, word for word: the static copy is what search engines, screen
// readers and visitors without motion receive. The film shows the same words.
const brief = {
  'index.html': {
    kicker: 'xSOM Consulting',
    title: 'Cabinet de conseil SI, cybersécurité et IA',
    lead: 'Gouvernance des systèmes d’information, cybersécurité et infrastructures d’intelligence artificielle. Depuis 2007, nous accompagnons les DSI de grands comptes sur leurs systèmes les plus critiques — du cadrage stratégique jusqu’à la mise en production.',
    next: ['Découvrir', '#offre'],
    offer: { id: 'offre', title: 'Trois pôles, une même exigence d’exécution', links: ['expertises.html#pole-cyber', 'ia-souverainete.html', 'expertises.html#pole-data'] },
    sound: 'Activer le son',
    cta: ['Nous contacter', 'Nous suivre sur LinkedIn'],
    banned: /conseil qui tient|Parlons de votre projet/i,
  },
  'en/index.html': {
    kicker: 'xSOM Consulting',
    title: 'IT, cybersecurity and AI consulting firm',
    lead: 'IT governance, cybersecurity and artificial intelligence infrastructure. Since 2007, we have advised the CIOs of large organisations on their most critical systems — from strategic framing through to production.',
    next: ['Discover', '#offer'],
    offer: { id: 'offer', title: 'Three practices, one standard of execution', links: ['expertise.html#practice-cyber', 'ai-sovereignty.html', 'expertise.html#practice-data'] },
    sound: 'Turn sound on',
    cta: ['Get in touch', 'Follow us on LinkedIn'],
    banned: /consulting that holds|Discuss your project/i,
  },
};

for (const [file, copy] of Object.entries(brief)) {
  const html = read(file);
  const section = hero(html);

  test(`${file}: static copy is the brief, without stock phrases`, () => {
    const text = between(section, '<div class="hero__text film-static">', '<div class="film-titles"');
    assert.match(text, new RegExp(`<p class="film-kicker">${copy.kicker}</p>`));
    assert.equal(strip(text.match(/<h1[\s\S]*?<\/h1>/)[0]), copy.title);
    assert.equal(strip(text.match(/<p class="lead">[\s\S]*?<\/p>/)[0]), copy.lead);
    assert.doesNotMatch(html.slice(html.indexOf('<main')), copy.banned);
  });

  test(`${file}: five decorative beats follow the five shots and end on the logo`, () => {
    const titles = section.slice(section.indexOf('<div class="film-titles"'), section.lastIndexOf('</section>'));
    assert.match(titles, /^<div class="film-titles" aria-hidden="true"/);
    const beats = [...titles.matchAll(/<div class="film-beat film-beat--(\w+)" data-shot="(\d)">/g)];
    assert.deepEqual(beats.map(b => Number(b[2])), [0, 1, 2, 3, 4]);
    const parts = titles.split(/<div class="film-beat /).slice(1);
    parts.forEach((beat, shot) => {
      const times = [...beat.matchAll(/data-(?:in|out|dim)="([\d.]+)"/g)].map(m => Number(m[1]));
      assert.ok(times.length > 0, `beat ${shot} is timed`);
      assert.ok(times.every(t => t >= shot * 6 && t < shot * 6 + 6), `beat ${shot} stays within its shot: ${times}`);
    });
    assert.match(parts[4], /class="film-mark"/);
    assert.match(parts[4], /xSOM Consulting/);
    // Every visible film word comes from the static brief.
    const briefWords = new Set(strip(`${copy.kicker} ${copy.title} ${copy.lead}`).toLowerCase().match(/[\p{L}\d’]+/gu));
    const filmWords = strip(titles.replace(/<svg[\s\S]*?<\/svg>/g, '')).toLowerCase().match(/[\p{L}\d’]+/gu);
    assert.deepEqual(filmWords.filter(word => !briefWords.has(word)), []);
  });

  test(`${file}: film bar offers Discover, play and sound`, () => {
    const next = section.match(/<a class="film-next" href="([^"]+)">\s*<span>([^<]+)<\/span>/);
    assert.ok(next, 'Discover link is present');
    assert.deepEqual([next[2], next[1]], copy.next);
    assert.match(section, /<button class="film-toggle" data-film-toggle /);
    // Sound starts off on every visit, as the cookies page states.
    const sound = section.match(/<button class="film-toggle film-sound" data-film-sound="off" [^>]*>/);
    assert.ok(sound, 'Sound button is present and off');
    assert.match(sound[0], new RegExp(`aria-label="${copy.sound}"`));
  });

  test(`${file}: the offer section follows the film with a drawn logo map and three illustrated cards`, () => {
    const offer = html.match(/<section class="home-offer" id="(\w+)"[\s\S]*?<\/section>/);
    assert.ok(offer, 'Offer section is present');
    assert.equal(offer[1], copy.offer.id);
    assert.ok(html.indexOf(offer[0]) > html.indexOf(section), 'Offer comes after the film');
    assert.equal(strip(offer[0].match(/<h2[\s\S]*?<\/h2>/)[0].replace(/<\/?span[^>]*>/g, '')), copy.offer.title);
    const map = offer[0].match(/<figure class="home-offer__map heritage-hero-art" data-hero-mark data-offer-map>[\s\S]*?<\/figure>/);
    assert.ok(map, 'Logo map is present');
    assert.match(map[0], /<svg class="heritage-mark offer-mark"/);
    assert.deepEqual([...map[0].matchAll(/data-mark-practice="\d" href="([^"]+)"/g)].map(m => m[1]), copy.offer.links);
    const cards = [...offer[0].matchAll(/<a class="offer-card" href="([^"]+)">([\s\S]*?)<\/a>/g)];
    assert.deepEqual(cards.map(c => c[1]), copy.offer.links);
    cards.forEach(([, , body], index) => {
      const src = body.match(/<img src="(?:\.\.\/)?(assets\/media\/xsom-pole-\d\.jpg)(?:\?v=\w+)?"/)[1];
      assert.ok(fs.existsSync(path.join(root, src)), `${src} exists`);
      const line = strip(body.match(/<p>[\s\S]*?<\/p>/)[0]);
      assert.ok(line.split(' ').length <= 10, `Card ${index + 1} keeps to one short line: ${line}`);
      assert.equal([...body.matchAll(/<li>/g)].length, 4, `Card ${index + 1} lists four keywords`);
    });
    // The film bar no longer carries the legal links: the page ends on the site footer.
    assert.doesNotMatch(section, /film-footer/);
    assert.match(html, /<!-- footer:start -->[\s\S]*mentions-legales\.html|legal-notice\.html/);
  });

  test(`${file}: presence map marks the seven missions, Bordeaux largest, with no remote asset`, () => {
    const presence = html.match(/<section class="home-presence" id="presence"[\s\S]*?<\/section>/);
    assert.ok(presence, 'Presence section is present');
    assert.ok(html.indexOf(presence[0]) > html.indexOf('class="home-offer"'), 'Presence follows the offer');
    const cities = [...presence[0].matchAll(/<li class="presence-label[^"]*" data-city="(\w+)"/g)].map(m => m[1]);
    assert.deepEqual(cities, ['bordeaux', 'paris', 'toulouse', 'nantes', 'marseille', 'dakar', 'mayotte']);
    const radius = Object.fromEntries([...presence[0].matchAll(/<g class="presence-point" data-city="(\w+)"[^>]*>[\s\S]*?<circle class="presence-dot" r="([\d.]+)"/g)].map(m => [m[1], Number(m[2])]));
    assert.ok(radius.bordeaux > radius.paris && radius.paris > radius.toulouse && radius.toulouse > radius.dakar, JSON.stringify(radius));
    assert.equal(radius.dakar, radius.mayotte);
    assert.ok(radius.nantes === radius.toulouse && radius.marseille === radius.toulouse, 'Nantes and Marseille are medium, like Toulouse');
    assert.doesNotMatch(presence[0], /https?:\/\//, 'The map loads nothing remote');
    assert.ok(fs.existsSync(path.join(root, 'assets/media/xsom-presence-land.svg')));
  });

  test(`${file}: closing call to action offers contact and LinkedIn`, () => {
    const cta = html.match(/<section class="home-cta"[\s\S]*?<\/section>/);
    assert.ok(cta, 'Call to action is present');
    assert.ok(html.indexOf(cta[0]) > html.indexOf('class="home-presence"'), 'It closes the page');
    assert.match(cta[0], new RegExp(`<a class="btn btn--primary" href="contact.html">${copy.cta[0]}</a>`));
    assert.match(cta[0], new RegExp(`<a class="btn btn--ghost home-cta__linkedin" href="https://www.linkedin.com/company/xsom-consulting" target="_blank" rel="noopener">${copy.cta[1]}`));
  });
}

test('Homepage film media carries a 30-second soundtrack', { skip: !hasFfprobe() && 'ffprobe is not installed' }, () => {
  for (const name of ['xsom-film-desktop.mp4', 'xsom-film-mobile.mp4']) {
    const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type', '-of', 'json', path.join(root, 'assets/media', name)], { encoding: 'utf8' }));
    assert.deepEqual(probe.streams.map(s => s.codec_type).sort(), ['audio', 'video'], `${name} has one video and one audio stream`);
    assert.ok(Math.abs(Number(probe.format.duration) - 30) < 0.1, `${name} lasts 30 seconds`);
  }
});

function hasFfprobe() {
  try { execFileSync('ffprobe', ['-version'], { stdio: 'ignore' }); return true; } catch { return false; }
}
