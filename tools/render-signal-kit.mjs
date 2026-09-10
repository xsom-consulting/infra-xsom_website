// Render brand assets from the actual shared logo and typography, using a local server on 4173.
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {copyFile} from 'node:fs/promises';
const site=resolve(process.argv[2]);const frontend=resolve(process.argv[3]);
const base=process.env.SITE_URL || 'http://127.0.0.1:4173';
const require=createRequire(resolve(frontend,'package.json'));const {chromium}=require('@playwright/test');
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
for(const lang of ['fr','en']){
  await page.goto(`${base}/design-system/og.html?lang=${lang}`);await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:resolve(site,`assets/images/og-cover${lang==='en'?'-en':''}.jpg`),type:'jpeg',quality:85});
}
for(const [size,name] of [[32,'favicon-32.png'],[180,'apple-touch-icon.png'],[512,'logo-512.png']]){
  await page.setViewportSize({width:size,height:size});
  const variant = size === 512 ? 'mark-light.svg' : 'mark.svg';
  await page.setContent(`<html><head><style>html,body{margin:0;width:100%;height:100%;background:transparent}img{display:block;width:100%;height:100%}</style></head><body><img src="${base}/design-system/assets/${variant}" alt=""></body></html>`);
  await page.locator('img').evaluate(image=>image.decode());await page.screenshot({path:resolve(site,'assets/logo',name),omitBackground:true});
}
await copyFile(resolve(site,'design-system/assets/mark.svg'),resolve(frontend,'app/icon.svg'));
await copyFile(resolve(site,'design-system/assets/mark.svg'),resolve(frontend,'public/xsom-mark.svg'));
await browser.close();console.log('Shared logo kit and bilingual OG covers rendered.');
