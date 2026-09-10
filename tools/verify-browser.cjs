#!/usr/bin/env node
/** Browser acceptance against a local static server. Network contact requests are always mocked. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '@playwright/test');
const base = process.env.SITE_URL || 'http://127.0.0.1:4173';
const output = process.env.SITE_QA_OUTPUT || '/tmp/xsom-site-qa';
const pages = ['index.html','expertises.html','ia-souverainete.html','ai-guard.html','cabinet.html','vision.html','carrieres.html','contact.html','mentions-legales.html','cookies.html','404.html','en/index.html','en/expertise.html','en/ai-sovereignty.html','en/ai-guard.html','en/firm.html','en/vision.html','en/careers.html','en/contact.html','en/legal-notice.html','en/cookies.html','en/404.html'];

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
  const failures = [], observations = [];
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(base);
  await page.route('https://api.web3forms.com/**', route => route.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({success:true})}));
  page.on('pageerror', error => failures.push({type:'runtime', url:page.url(), error:error.message}));
  const requests = [];
  page.on('request', request => { if (!request.url().startsWith(base) && !request.url().startsWith('data:')) requests.push(request.url()); });
  for (const theme of ['dark', 'light']) {
    await page.evaluate(value => localStorage.setItem('xsom-signal-preferences', JSON.stringify({theme:value,reduced:true,sound:false})), theme);
    for (const width of [390,768,1440]) {
      await page.setViewportSize({width, height:900});
      for (const file of pages) {
        await page.goto(`${base}/${file}`, {waitUntil:'domcontentloaded'});
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction(() => !!document.querySelector('signal-preferences button'));
        // Full-page captures must include assets below the initial viewport.
        await page.evaluate(async () => {
          for (const image of document.images) image.loading = 'eager';
          await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
        });
        const result = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth,
          width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
          missingImages: [...document.images].filter(img => img.complete && img.naturalWidth === 0).map(img=>img.src),
          headings: document.querySelectorAll('h1').length,
          theme: document.documentElement.dataset.theme,
          links: [...document.querySelectorAll('main a')].filter(a => !a.getAttribute('href')).length,
          overflowing: [...document.querySelectorAll('main *')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0 && (r.right>innerWidth+1||r.left < -1)&&!el.closest('.hp');}).slice(0,10).map(el=>el.tagName+'.'+el.className)
        }));
        if(result.overflow || result.missingImages.length || result.headings!==1 || result.links || result.theme!==theme) failures.push({file,width,theme,...result});
        observations.push({file,width,theme,overflowing:result.overflowing});
        if (!file.startsWith('en/')) await page.screenshot({path:path.join(output,`${file.replace('.html','')}-${theme}-${width}.png`),fullPage:true});
      }
    }
  }
  // Keyboard navigation and per-field contact feedback.
  await page.setViewportSize({width:390,height:900});
  await page.goto(`${base}/index.html`);
  const menu = page.locator('[data-menu]');
  await menu.focus(); await page.keyboard.press('Enter');
  assert.equal(await menu.getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  assert.equal(await menu.evaluate(el=>el===document.activeElement), true);
  await page.locator('signal-preferences [data-action=theme]').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  await page.locator('signal-preferences [data-action=motion]').click();
  assert.equal(await page.locator('html').getAttribute('data-motion'),'on');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>document.documentElement.dataset.motion==='off');
  await page.goto(`${base}/contact.html`);
  await page.getByRole('button',{name:'Envoyer le message'}).click();
  assert.equal(await page.locator('[aria-invalid=true]').count(), 5);
  await page.locator('#f-name').fill('Vérification locale — aucun envoi');
  await page.locator('#f-email').fill('not-an-email');
  await page.locator('#f-company').focus();
  assert.equal(await page.locator('#f-email').getAttribute('aria-invalid'),'true');
  await page.locator('#f-email').fill('qa@example.invalid');
  await page.locator('#f-subject').selectOption({index:1});
  await page.locator('#f-message').fill('Validation locale avec service de formulaire simulé.');
  await page.locator('#f-consent').check();
  await page.getByRole('button',{name:'Envoyer le message'}).click();
  await page.locator('.form__status.is-success').waitFor();
  assert.equal(await page.locator('#f-name').inputValue(),'');
  await page.route('https://api.web3forms.com/**',route=>route.abort('failed'));
  await page.locator('#f-name').fill('Vérification locale');
  await page.locator('#f-email').fill('qa@example.invalid');
  await page.locator('#f-subject').selectOption({index:1});
  await page.locator('#f-message').fill('Le contenu doit rester après erreur.');
  await page.locator('#f-consent').check();
  await page.getByRole('button',{name:'Envoyer le message'}).click();
  await page.locator('.form__status.is-error').waitFor();
  assert.equal(await page.locator('#f-message').inputValue(),'Le contenu doit rester après erreur.');
  assert.ok((await page.locator('.form__status a').getAttribute('href')).startsWith('mailto:'));
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:path.join(output,'contact-error-390.png'),fullPage:true});
  // No external runtime requests except explicitly mocked contact submission.
  assert.deepEqual([...new Set(requests.filter(url=>!url.startsWith('https://api.web3forms.com/')))],[]);
  const noScript = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});
  const fallback = await noScript.newPage();
  await fallback.goto(base);
  assert.ok(await fallback.locator('.signal-navigation').isVisible());
  assert.match(await fallback.locator('signal-poles').textContent(),/Télécom/);
  await noScript.close();
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({failures,observations,pages:pages.length,layouts:pages.length*6,contact:'mocked-success-and-failure',externalRuntimeRequests:requests.filter(url=>!url.startsWith('https://api.web3forms.com/'))},null,2));
  await browser.close();
  console.log(JSON.stringify({layouts:pages.length*6,failures,output},null,2));
  process.exitCode = failures.length ? 1 : 0;
})().catch(error => {console.error(error);process.exit(1);});
