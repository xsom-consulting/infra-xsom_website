#!/usr/bin/env node
/** Original mark regression: expertise placement, bilingual links and unchanged logo. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '@playwright/test');
const base = process.env.SITE_URL || 'http://127.0.0.1:4173';
const output = process.env.SITE_QA_OUTPUT || '/tmp/xsom-original-mark-final';

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [], observations = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => localStorage.setItem('xsom-signal-preferences', JSON.stringify({ theme, reduced: false })), theme);
      for (const width of [1440, 736, 768, 390]) {
        await page.setViewportSize({ width, height: width === 736 ? 734 : 900 });
        for (const file of ['index.html', 'en/index.html']) {
          await page.goto(`${base}/${file}`, { waitUntil: 'domcontentloaded' });
          await page.evaluate(() => document.fonts.ready);
          await page.locator('.heritage-mark').evaluate(image => image.decode());
          await page.locator('.film-expertise-intro').scrollIntoViewIfNeeded();
          const result = await page.evaluate(() => {
            const image = document.querySelector('.heritage-mark');
            return {
              width: innerWidth, overflow: document.documentElement.scrollWidth > innerWidth,
              logo: image.getBoundingClientRect().toJSON(), loaded: image.naturalWidth > 0,
              heading: document.querySelector('#offer-title').getBoundingClientRect().toJSON(),
              src: image.src, theme: document.documentElement.dataset.theme,
              links: [...document.querySelectorAll('[data-mark-practice]')].map(link => ({ href: link.href, height: link.getBoundingClientRect().height })),
            };
          });
          assert.equal(result.overflow, false);
          assert.equal(result.theme, theme);
          assert.equal(result.loaded, true);
          assert.ok(result.src.endsWith(theme === 'dark' ? 'moderne-dark.svg' : 'gradient.svg'));
          assert.equal(result.links.length, 3);
          assert.ok(result.links.every(link => link.height >= 44));
          if (width >= 700) {
            assert.ok(result.logo.left > result.heading.right, `Logo must sit to the right at ${width}px`);
          } else {
            assert.ok(result.logo.top > result.heading.bottom, 'Phone layout places logo after the expertise introduction');
          }
          observations.push({ file, theme, ...result });
          await page.screenshot({ path: path.join(output, `${file.startsWith('en/') ? 'en' : 'fr'}-${theme}-${width}.png`) });
        }
      }
    }
    for (const file of ['index.html', 'en/index.html']) {
      for (let id = 1; id <= 3; id++) {
        await page.goto(`${base}/${file}`, { waitUntil: 'domcontentloaded' });
        const link = page.locator(`[data-mark-practice="${id}"]`);
        const destination = await link.evaluate(element => element.href);
        await link.focus();
        assert.equal(await page.locator('[data-hero-mark]').getAttribute('data-focus'), String(id));
        assert.equal(await link.evaluate(element => getComputedStyle(element).outlineStyle), 'solid');
        await Promise.all([page.waitForURL(destination), page.keyboard.press('Enter')]);
        const fragment = new URL(destination).hash.slice(1);
        if (fragment) assert.equal(await page.locator(`[id="${fragment}"]`).count(), 1);
      }
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(base);
    assert.equal(await page.locator('html').getAttribute('data-motion'), 'off');
    assert.equal(await page.locator('.heritage-mark-routes path').first().evaluate(element => getComputedStyle(element).transitionDuration), '0s');
    const fallback = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 736, height: 734 } });
    const noScript = await fallback.newPage();
    await noScript.goto(base);
    assert.equal(await noScript.locator('[data-mark-practice]').count(), 3);
    assert.ok(await noScript.locator('.heritage-mark').isVisible());
    await Promise.all([noScript.waitForURL(`${base}/ia-souverainete.html`), noScript.locator('[data-mark-practice="2"]').click()]);
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({ layouts: observations.length, observations, errors, keyboard: 'six real FR/EN links, focus and Enter', reducedMotion: 'OS disables transitions', noJavaScript: 'original mark and real links work' }, null, 2));
    console.log(JSON.stringify({ layouts: observations.length, errors, output }));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
