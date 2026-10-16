#!/usr/bin/env node
/** Browser acceptance against a local static server. Network contact requests are always mocked. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '@playwright/test');
const base = process.env.SITE_URL || 'http://127.0.0.1:4173';
const output = process.env.SITE_QA_OUTPUT || '/tmp/xsom-site-qa';
// L'envoi des formulaires (serveur de la division IA) est toujours simulé : jamais d'appel réel.
const CONTACT = 'https://ai.xsom.fr/api/contact';
const cors = {'access-control-allow-origin':'*','access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'content-type, accept'};
const sent = [];
// Simule le serveur : préflight CORS, puis réponse JSON au statut demandé ; ou coupure réseau.
const mockContact = (page, outcome) => page.route(CONTACT, route => {
  const request = route.request();
  if (request.method() === 'OPTIONS') return route.fulfill({status:204, headers:cors});
  if (outcome === 'abort') return route.abort('failed');
  sent.push(request.postDataJSON());
  return route.fulfill({status:outcome, headers:cors, contentType:'application/json', body:JSON.stringify(outcome === 200 ? {ok:true} : {ok:false})});
});
const pages = ['index.html','expertises.html','cabinet.html','carrieres.html','contact.html','mentions-legales.html','cookies.html','404.html','en/index.html','en/expertise.html','en/firm.html','en/careers.html','en/contact.html','en/legal-notice.html','en/cookies.html','en/404.html'];

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
  const failures = [], observations = [];
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(base);
  await mockContact(page, 200);
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
        // The film homepages carry no preferences panel (user request, 2026-09-26).
        if (!file.endsWith('index.html')) await page.waitForFunction(() => !!document.querySelector('signal-preferences button'));
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
  const menu = page.locator('[data-nav-toggle]');
  await menu.focus(); await page.keyboard.press('Enter');
  assert.equal(await menu.getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  assert.equal(await menu.evaluate(el=>el===document.activeElement), true);
  await page.goto(`${base}/expertises.html`);
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
  const posted = sent.at(-1);
  assert.equal(posted.name,'Vérification locale — aucun envoi');
  assert.equal(posted.email,'qa@example.invalid');
  assert.equal(posted.lang,'fr');
  assert.equal(posted.botcheck,false);
  assert.ok(posted.subject && posted.message.length >= 10);
  await page.unroute(CONTACT);
  await mockContact(page, 502);
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
  await page.unroute(CONTACT);
  // Homepage closing section: "Nous contacter" unfolds the compact form in place.
  for (const width of [390,1440]) {
    await page.setViewportSize({width,height:900});
    await page.goto(`${base}/index.html`);
    await mockContact(page, 200);
    const toggle = page.locator('.home-cta [data-contact-toggle]');
    assert.equal(await toggle.getAttribute('aria-expanded'),'false');
    assert.equal(await toggle.getAttribute('aria-controls'),'home-contact');
    assert.equal(await page.locator('#home-contact').isVisible(),false);
    await toggle.scrollIntoViewIfNeeded();
    await toggle.click();
    assert.equal(await toggle.getAttribute('aria-expanded'),'true');
    assert.ok(await page.locator('#home-contact-form').isVisible());
    assert.equal(await page.locator('#h-name').evaluate(el=>el===document.activeElement),true);
    assert.ok(page.url().endsWith('/index.html'),'The page did not navigate');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`No overflow at ${width} with the form open`);
    await page.getByRole('button',{name:'Envoyer le message'}).click();
    assert.equal(await page.locator('#home-contact-form [aria-invalid=true]').count(),4);
    await page.locator('#h-name').fill('Vérification locale — aucun envoi');
    await page.locator('#h-email').fill('qa@example.invalid');
    await page.locator('#h-message').fill('Court');
    await page.locator('#h-consent').check();
    await page.getByRole('button',{name:'Envoyer le message'}).click();
    assert.equal(await page.locator('#h-message').getAttribute('aria-invalid'),'true','Messages under ten characters are refused locally');
    await page.locator('#h-message').fill('Validation locale avec serveur de formulaire simulé.');
    await page.getByRole('button',{name:'Envoyer le message'}).click();
    await page.locator('#home-contact-form .form__status.is-success').waitFor();
    assert.equal(sent.at(-1).company,'');
    assert.equal(sent.at(-1).lang,'fr');
    await page.locator('#home-contact-form').screenshot({path:path.join(output,`home-contact-success-${width}.png`)});
    await page.unroute(CONTACT);
    await mockContact(page, 'abort');
    await page.locator('#h-name').fill('Vérification locale');
    await page.locator('#h-email').fill('qa@example.invalid');
    await page.locator('#h-message').fill('Le contenu doit rester après erreur.');
    await page.locator('#h-consent').check();
    await page.getByRole('button',{name:'Envoyer le message'}).click();
    await page.locator('#home-contact-form .form__status.is-error').waitFor();
    assert.equal(await page.locator('#h-message').inputValue(),'Le contenu doit rester après erreur.');
    assert.ok((await page.locator('#home-contact-form .form__status a').getAttribute('href')).startsWith('mailto:'));
    await page.locator('.home-cta').screenshot({path:path.join(output,`home-contact-error-${width}.png`)});
    await page.unroute(CONTACT);
    // A second press folds it again.
    await toggle.click();
    assert.equal(await toggle.getAttribute('aria-expanded'),'false');
    assert.equal(await page.locator('#home-contact').isVisible(),false);
  }
  // English homepage: same form, English payload.
  await page.goto(`${base}/en/index.html`);
  await mockContact(page, 200);
  await page.locator('.home-cta [data-contact-toggle]').click();
  await page.locator('#h-name').fill('Local check — nothing sent');
  await page.locator('#h-email').fill('qa@example.invalid');
  await page.locator('#h-message').fill('Local validation with a mocked form server.');
  await page.locator('#h-consent').check();
  await page.getByRole('button',{name:'Send the message'}).click();
  await page.locator('#home-contact-form .form__status.is-success').waitFor();
  assert.equal(sent.at(-1).lang,'en');
  await page.unroute(CONTACT);
  // Return from a native (no-JavaScript) POST: the server appends ?envoi=ok.
  await page.goto(`${base}/index.html?envoi=ok`);
  await page.locator('#home-contact-form .form__status.is-success').waitFor();
  assert.equal(await page.locator('.home-cta [data-contact-toggle]').getAttribute('aria-expanded'),'true');
  assert.ok(!page.url().includes('envoi='),'The result parameter is removed from the address');
  // Footer: the LinkedIn logo replaces the email address.
  await page.setViewportSize({width:390,height:900});
  for (const theme of ['light','dark']) {
    await page.evaluate(value => localStorage.setItem('xsom-signal-preferences', JSON.stringify({theme:value,reduced:true,sound:false})), theme);
    await page.goto(`${base}/expertises.html`);
    const footerLink = page.getByRole('link',{name:'xSOM Consulting sur LinkedIn'}).last();
    assert.ok(await footerLink.isVisible());
    assert.equal(await page.locator('footer a[href^="mailto:"]').count(),0);
    await page.locator('.site-footer__top').screenshot({path:path.join(output,`footer-${theme}-390.png`)});
  }
  // No external runtime requests except explicitly mocked contact submission.
  assert.deepEqual([...new Set(requests.filter(url=>!url.startsWith(CONTACT)))],[]);
  const noScript = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});
  const fallback = await noScript.newPage();
  await fallback.goto(base);
  assert.ok(await fallback.locator('#nav-panel').isVisible());
  // Without JavaScript the film homepage keeps its static copy.
  assert.match(await fallback.locator('h1').textContent(),/Cabinet de conseil SI, cybersécurité et IA/);
  // Without JavaScript "Nous contacter" stays a plain link to the contact page; the form stays folded.
  const plain = fallback.locator('.home-cta a.btn--primary');
  assert.equal(await plain.getAttribute('href'),'contact');
  assert.equal(await plain.getAttribute('aria-expanded'),null);
  assert.equal(await fallback.locator('#home-contact').isVisible(),false);
  await fallback.goto(`${base}/contact.html`);
  assert.equal(await fallback.locator('#contact-form').getAttribute('method'),'post');
  assert.equal(await fallback.locator('#contact-form').getAttribute('action'),CONTACT);
  await noScript.close();
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({failures,observations,pages:pages.length,layouts:pages.length*6,contact:'mocked-success-and-failure',externalRuntimeRequests:requests.filter(url=>!url.startsWith(CONTACT))},null,2));
  await browser.close();
  console.log(JSON.stringify({layouts:pages.length*6,failures,output},null,2));
  process.exitCode = failures.length ? 1 : 0;
})().catch(error => {console.error(error);process.exit(1);});
