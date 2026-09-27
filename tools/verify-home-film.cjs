#!/usr/bin/env node
// Real media playback, fallbacks and responsive checks against a static preview.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '@playwright/test');
const base = process.env.SITE_URL || 'http://127.0.0.1:4273';
const output = process.env.SITE_QA_OUTPUT || '/tmp/xsom-home-film';
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const report = { layouts: [], behaviors: [], errors: [] };
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on('pageerror', e => report.errors.push(e.message));
    await page.goto(base);
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => localStorage.setItem('xsom-signal-preferences', JSON.stringify({ theme })), theme);
      for (const width of [1440, 768, 736, 390]) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : width === 736 ? 734 : 900 });
        for (const file of ['index.html', 'en/index.html']) {
          await page.goto(`${base}/${file}`, { waitUntil: 'domcontentloaded' });
          await page.evaluate(() => document.fonts.ready);
          await page.waitForFunction(() => document.querySelector('.film-video').currentTime > 0.1);
          const result = await page.evaluate(() => {
            const video = document.querySelector('.film-video');
            const hero = document.querySelector('[data-home-film]');
            const box = el => el.getBoundingClientRect().toJSON();
            // Measure every beat at rest: the timeline's transforms would skew the boxes.
            const rest = document.createElement('style');
            rest.textContent = '.film-titles, .film-titles * { transform: none !important; }';
            document.head.append(rest);
            const titles = [...hero.querySelectorAll('.film-stack, .film-emblem, .film-wordmark, .film-line > span, .film-slam b, .film-slam i')].map(box);
            rest.remove();
            const buttons = [...hero.querySelectorAll('.film-controls button')].map(box);
            const legal = [...hero.querySelectorAll('.film-footer a')].map(box);
            return { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth,
              theme: document.documentElement.dataset.theme, source: video.currentSrc, playing: !video.paused,
              muted: video.muted, inline: video.playsInline, loop: video.loop, duration: video.duration,
              toggleAction: hero.querySelector('[data-film-toggle]').dataset.filmAction,
              sound: hero.querySelector('[data-film-sound]').dataset.filmSound,
              titlesShown: getComputedStyle(hero.querySelector('.film-titles')).display === 'block',
              copyHidden: hero.querySelector('.hero__text').getBoundingClientRect().width <= 1,
              header: box(document.querySelector('.site-header')), next: box(hero.querySelector('.film-next')),
              hero: box(hero), titles, buttons, legal,
              imagesLoaded: [...hero.querySelectorAll('img')].every(i => i.complete && i.naturalWidth > 0) };
          });
          const apart = (a, b) => a.bottom <= b.top || a.top >= b.bottom || a.right <= b.left || a.left >= b.right;
          assert.equal(result.scrollWidth, width);
          assert.equal(result.theme, theme);
          assert.ok(result.playing && result.muted && result.inline && result.loop && result.imagesLoaded);
          assert.equal(result.toggleAction, 'pause');
          assert.equal(result.sound, 'off', 'Sound starts off');
          assert.ok(result.titlesShown && result.copyHidden, 'Live titles replace the static copy while the film plays');
          assert.ok(Math.abs(result.duration - 30) < .1);
          assert.match(result.source, width < 700 ? /film-mobile\.mp4/ : /film-desktop\.mp4/);
          assert.ok(result.hero.height >= result.height);
          assert.ok(result.hero.height <= result.height + 1, 'The homepage fits in one viewport');
          const controls = [result.next, ...result.buttons, ...result.legal];
          for (const title of result.titles) {
            assert.ok(title.left >= 0 && title.right <= width, `Film words stay within the width: ${JSON.stringify(title)}`);
            assert.ok(title.top >= result.header.bottom - 1, 'Film words stay below the navigation');
            assert.ok(controls.every(control => title.bottom <= control.top), 'Film words stay above Discover and the controls');
          }
          assert.equal(result.buttons.length, 2);
          assert.ok(controls.every(c => c.height >= 44 && c.top >= 0 && c.bottom <= result.height && c.right <= width), 'Discover, play, sound and legal links are available in the first viewport');
          controls.forEach((a, i) => controls.slice(i + 1).forEach(b => assert.ok(apart(a, b), 'Bottom bar items do not overlap')));
          report.layouts.push({ file, ...result });
          await page.screenshot({ path: path.join(output, `${file.startsWith('en/') ? 'en' : 'fr'}-${theme}-${width}.png`) });
        }
      }
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(base);
    const video = page.locator('.film-video');
    const toggle = page.locator('[data-film-toggle]');
    await page.waitForFunction(() => !document.querySelector('video').paused);
    await toggle.focus();
    await page.keyboard.press('Enter');
    assert.equal(await video.evaluate(v => v.paused), true);
    assert.equal(await toggle.getAttribute('aria-label'), 'Lire la vidéo');
    assert.equal(await toggle.getAttribute('data-film-action'), 'play');
    await page.mouse.click(720, 300);
    assert.equal(await video.evaluate(v => v.paused), true, 'User pause survives other interactions');
    assert.equal(await page.locator('[data-home-film]').getAttribute('data-film-state'), 'paused', 'Paused film keeps its live titles');
    await toggle.click();
    await page.waitForFunction(() => {
      const video = document.querySelector('video');
      const toggle = document.querySelector('[data-film-toggle]');
      return !video.paused && toggle.dataset.filmAction === 'pause';
    });
    assert.equal(await toggle.getAttribute('aria-label'), 'Mettre en pause');
    assert.equal(await toggle.getAttribute('data-film-action'), 'pause');
    const sound = page.locator('[data-film-sound]');
    assert.equal(await sound.getAttribute('aria-label'), 'Activer le son');
    await sound.click();
    assert.equal(await video.evaluate(v => v.muted), false);
    assert.equal(await sound.getAttribute('data-film-sound'), 'on');
    assert.equal(await sound.getAttribute('aria-label'), 'Couper le son');
    await toggle.click();
    assert.equal(await video.evaluate(v => v.paused), true);
    await sound.click();
    await sound.click();
    await page.waitForFunction(() => !document.querySelector('video').paused && !document.querySelector('video').muted);
    report.behaviors.push('Sound toggles on and off, and turning it on resumes a paused film');
    await sound.click();
    assert.equal(await video.evaluate(v => v.muted), true);
    const next = page.locator('.film-next');
    assert.equal(await next.getAttribute('href'), '#offre');
    assert.equal((await next.innerText()).trim().toLowerCase(), 'découvrir');
    // Discover glides to the offer, whose logo map then draws itself in.
    await next.click();
    await page.waitForFunction(() => Math.abs(document.querySelector('#offre').getBoundingClientRect().top) < 2 && document.querySelector('[data-offer-map]').dataset.play === 'done');
    await page.waitForTimeout(2600);
    assert.equal(await page.locator('.heritage-mark-link').evaluateAll(links => links.every(l => getComputedStyle(l).opacity === '1')), true, 'Practice links end fully visible');
    report.behaviors.push('Discover glides to the offer; the map draws in and ends fully visible');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForFunction(() => window.scrollY === 0 && !document.querySelector('video').paused);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelector('video').paused && getComputedStyle(document.querySelector('video')).display === 'none');
    assert.equal(await toggle.isVisible(), false);
    assert.equal(await sound.isVisible(), false);
    assert.equal(await page.locator('h1').isVisible(), true, 'Reduced motion shows the static copy');
    assert.equal(await page.locator('.film-titles').isVisible(), false);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => !document.querySelector('video').paused);
    await page.screenshot({ path: path.join(output, 'fr-playing.png') });
    report.behaviors.push('Real autoplay, keyboard pause/resume, persistent user pause, live OS preference');
    // The expertise page carries the same film treatment: 18 s, live titles, the same bar.
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const pageFilms = [['expertises.html', 1440, 900, 18], ['en/expertise.html', 390, 844, 18], ['ia-souverainete.html', 1440, 900, 18], ['en/ai-sovereignty.html', 390, 844, 18], ['carrieres.html', 768, 900, 18], ['en/careers.html', 390, 844, 18]];
    for (const [file, width, height, seconds] of pageFilms) {
      await page.setViewportSize({ width, height });
      await page.goto(`${base}/${file}`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.querySelector('.film-video').currentTime > 0.1);
      const film = await page.evaluate(() => {
        const hero = document.querySelector('[data-home-film]');
        const video = hero.querySelector('video');
        const box = el => el.getBoundingClientRect().toJSON();
        const rest = document.createElement('style');
        rest.textContent = '.film-titles, .film-titles * { transform: none !important; }';
        document.head.append(rest);
        const titles = [...hero.querySelectorAll('.film-stack')].map(box);
        rest.remove();
        return { duration: video.duration, playing: !video.paused, muted: video.muted, source: video.currentSrc, width: innerWidth,
          scrollWidth: document.documentElement.scrollWidth, titlesShown: getComputedStyle(hero.querySelector('.film-titles')).display === 'block',
          copyHidden: hero.querySelector('.film-static').getBoundingClientRect().width <= 1, titles,
          index: hero.querySelector('.expertise-hero__index') && box(hero.querySelector('.expertise-hero__index')), header: box(document.querySelector('.site-header')),
          bar: [box(hero.querySelector('.film-next')), ...[...hero.querySelectorAll('.film-controls button')].map(box)] };
      });
      assert.ok(Math.abs(film.duration - seconds) < .1 && film.playing && film.muted, `${file}: the ${seconds}-second film plays muted`);
      assert.match(film.source, width < 700 ? /-mobile\.mp4/ : /-desktop\.mp4/);
      assert.equal(film.scrollWidth, film.width);
      assert.ok(film.titlesShown && film.copyHidden, `${file}: live titles replace the static copy`);
      // Beats sit below the header and above the practice index, or above the bar when there is none.
      const floor = film.index ? film.index.top : Math.min(...film.bar.map(item => item.top));
      for (const title of film.titles) {
        assert.ok(title.top >= film.header.bottom - 1 && title.bottom <= floor && title.right <= film.width, `${file}: beats sit between the header and the foot of the film`);
      }
      if (film.index) assert.ok(film.bar.every(item => item.top >= film.index.bottom - 1), `${file}: the bar sits below the index`);
      await page.screenshot({ path: path.join(output, `${file.replace(/\W+/g, '-')}-${width}.png`) });
    }
    report.behaviors.push('Expertise, AI & sovereignty and careers films: 18 s, live titles clear of header, index and bar');
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const state of ['reduced', 'saved-reduced', 'no-javascript', 'failed-media', 'blocked-autoplay']) {
      const isolated = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: state !== 'no-javascript', reducedMotion: state === 'reduced' ? 'reduce' : 'no-preference' });
      if (state === 'saved-reduced') await isolated.addInitScript(() => localStorage.setItem('xsom-signal-preferences', JSON.stringify({ reduced: true })));
      if (state === 'blocked-autoplay') await isolated.addInitScript(() => { HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('Autoplay blocked', 'NotAllowedError')); });
      const fallback = await isolated.newPage();
      const requests = [];
      fallback.on('request', r => { if (/\.mp4(?:\?|$)/.test(r.url())) requests.push(r.url()); });
      fallback.on('pageerror', e => report.errors.push(e.message));
      if (state === 'failed-media') await fallback.route('**/*.mp4*', route => route.abort());
      await fallback.goto(base);
      await fallback.locator('.film-poster img').evaluate(i => i.decode());
      if (state === 'failed-media') await fallback.waitForFunction(() => document.querySelector('video').error !== null);
      assert.equal(await fallback.locator('.film-poster').isVisible(), true);
      if (['failed-media', 'blocked-autoplay'].includes(state)) await fallback.waitForFunction(() => document.querySelector('[data-home-film]').dataset.filmState === 'still');
      assert.equal(await fallback.locator('h1').isVisible(), true);
      assert.equal(await fallback.locator('.film-titles').isVisible(), false);
      assert.equal(await fallback.locator('video').evaluate(v => v.paused), true);
      if (['reduced', 'saved-reduced', 'no-javascript'].includes(state)) assert.equal(requests.length, 0, `${state}: no film download`);
      await fallback.screenshot({ path: path.join(output, `${state}.png`) });
      report.behaviors.push(`${state}: poster and editorial content remain accessible`);
      await isolated.close();
    }
    assert.deepEqual(report.errors, []);
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ layouts: report.layouts.length, behaviors: report.behaviors, errors: report.errors, output }));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
