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
            const text = hero.querySelector('.hero__text').getBoundingClientRect();
            const pause = hero.querySelector('button').getBoundingClientRect();
            const links = [...hero.querySelectorAll('.hero__actions a')].map(a => a.getBoundingClientRect().toJSON());
            return { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth,
              theme: document.documentElement.dataset.theme, source: video.currentSrc, playing: !video.paused,
              muted: video.muted, inline: video.playsInline, loop: video.loop, duration: video.duration,
              hero: hero.getBoundingClientRect().toJSON(), text: text.toJSON(), pause: pause.toJSON(), links,
              imagesLoaded: [...hero.querySelectorAll('img')].every(i => i.complete && i.naturalWidth > 0) };
          });
          assert.equal(result.scrollWidth, width);
          assert.equal(result.theme, theme);
          assert.ok(result.playing && result.muted && result.inline && result.loop && result.imagesLoaded);
          assert.ok(Math.abs(result.duration - 30) < .1);
          assert.match(result.source, width < 700 ? /film-mobile\.mp4/ : /film-desktop\.mp4/);
          assert.ok(result.hero.height >= result.height);
          if (width === 1440) assert.ok(result.text.right <= width * .45, 'Editorial content stays within the left 45% of the viewport');
          assert.ok(result.pause.height >= 44);
          assert.ok(result.pause.top >= 0 && result.pause.bottom <= result.height, 'Pause is available in the first viewport');
          assert.ok(result.links.every(a => a.height >= 44 && a.right <= width && (a.bottom <= result.pause.top || a.top >= result.pause.bottom || a.right <= result.pause.left || a.left >= result.pause.right)));
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
    assert.equal(await toggle.textContent(), 'Lire la vidéo');
    await page.locator('#offer-title').scrollIntoViewIfNeeded();
    await page.locator('h1').scrollIntoViewIfNeeded();
    assert.equal(await video.evaluate(v => v.paused), true, 'User pause survives scroll');
    await toggle.click();
    await page.waitForFunction(() => !document.querySelector('video').paused);
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('video').paused);
    await page.locator('h1').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => !document.querySelector('video').paused);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelector('video').paused && getComputedStyle(document.querySelector('video')).display === 'none');
    assert.equal(await toggle.isVisible(), false);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => !document.querySelector('video').paused);
    await page.screenshot({ path: path.join(output, 'fr-playing.png') });
    await page.locator('[data-hero-mark]').screenshot({ path: path.join(output, 'expertise-mark.png') });
    report.behaviors.push('Real autoplay, keyboard pause/resume, persistent user pause, offscreen pause/resume, live OS preference');
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
      assert.equal(await fallback.locator('h1').isVisible(), true);
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
