import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
const site=resolve(process.argv[2]);
const frontend=resolve(process.argv[3]);
const require=createRequire(resolve(frontend,'package.json'));
const {chromium}=require('@playwright/test');
const capture=resolve(site,'../media-capture');
const assets=resolve(site,'design-system/assets');
await mkdir(capture,{recursive:true});
const browser=await chromium.launch();
for(const variant of ['guarded','unguarded']){
  const context=await browser.newContext({viewport:{width:960,height:540},deviceScaleFactor:1,recordVideo:{dir:capture,size:{width:960,height:540}}});
  const page=await context.newPage();
  await page.goto('http://localhost:4173/design-system/preview.html');
  await page.waitForFunction(()=>!!customElements.get('signal-flow'));
  await page.evaluate(variant=>{
    document.body.innerHTML=`<main class="signal-capture"><header><img src="/design-system/assets/mark.svg" width="48" height="48"><span>xSOM <b>AI Guard</b></span><small>ILLUSTRATIVE SEQUENCE / ${variant.toUpperCase()}</small></header><signal-flow lang="fr" mode="demo" interactive verdict="hitl">Agent → Guard → Policy → Outil.</signal-flow><footer>CONTROL THE ACTION. KEEP THE EVIDENCE.</footer></main>`;
    const style=document.createElement('style');style.textContent='body{margin:0;background:var(--signal-bg);color:var(--signal-text)}.signal-capture{padding:var(--sp-8);display:grid;gap:var(--sp-8)}.signal-capture header{display:flex;align-items:center;gap:var(--sp-4);font:600 var(--fs-h3) var(--signal-font-display)}.signal-capture header small{margin-left:auto;font:500 var(--fs-label) var(--signal-font-mono);color:var(--signal-faint)}.signal-capture footer{font:500 var(--fs-label) var(--signal-font-mono);letter-spacing:var(--signal-tracking);color:var(--signal-faint)}.signal-flow__track{min-height:var(--signal-diagram-min)}';document.head.append(style);
    if(variant==='unguarded')document.querySelector('signal-flow [data-action="guarded"]').click();
  },variant);
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({path:resolve(capture,`${variant}.png`)});
  await page.locator('signal-flow [data-action="replay"]').click();
  await page.waitForTimeout(1800);
  if(variant==='guarded')await page.locator('signal-flow [data-value="deny"]').click();
  await page.waitForTimeout(1800);
  await page.locator('signal-flow [data-action="replay"]').click();
  await page.waitForTimeout(1600);
  const video=page.video();await context.close();const file=await video.path();
  execFileSync('ffmpeg',['-y','-loglevel','error','-i',file,'-an','-vf','fps=24','-c:v','libvpx-vp9','-b:v','0','-crf','38',resolve(assets,`${variant}.webm`)]);
  execFileSync('ffmpeg',['-y','-loglevel','error','-i',file,'-an','-vf','fps=24','-c:v','libx264','-preset','slow','-crf','28','-pix_fmt','yuv420p','-movflags','+faststart',resolve(assets,`${variant}.mp4`)]);
  execFileSync(process.env.CWEBP_BIN || 'cwebp',['-quiet','-q','85',resolve(capture,`${variant}.png`),'-o',resolve(assets,`${variant}.webp`)]);
  console.log(`${variant}: WebM, MP4 and WebP poster generated from actual shared diagram`);
}
await browser.close();
