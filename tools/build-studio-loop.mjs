#!/usr/bin/env node
// The AI page's xSOM AI Studio section plays the same footage as guard.xsom.fr's opening
// film, so the two sites read as one. The source is the clean Grok clip that film was cut
// from (no burned-in titles: this page sets its own, live). Silent, looped seamlessly: the
// last second cross-fades into the first, so the loop point never shows.
// Usage: node tools/build-studio-loop.mjs ~/Downloads/grok-video-fb42b927-cd11-4b13-be08-c87949634930-2.mp4
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DESKTOP, MOBILE, output, run } from './film-edit.mjs';

const [source] = process.argv.slice(2);
if (!source || !fs.existsSync(source)) throw new Error('Usage: node tools/build-studio-loop.mjs /path/to/ai-studio-source.mp4');
const END = 15;
const BLEND = 1;
// The mesh-covered office, the film's closing image: the still for reduced motion.
const POSTER_AT = 12.4;
const loop = `[0:v]split[a][b];[a]trim=${BLEND}:${END},setpts=PTS-STARTPTS[body];[b]trim=0:${BLEND},setpts=PTS-STARTPTS[head];[body][head]xfade=transition=fade:duration=${BLEND}:offset=${END - 2 * BLEND}`;
for (const [variant, frame, crf] of [['desktop', DESKTOP, '27'], ['mobile', MOBILE.replace('0.78', '0.5'), '28']]) {
  const file = path.join(output, `xsom-studio-${variant}.mp4`);
  run(['-i', source, '-filter_complex', `${loop},${frame}[v]`, '-map', '[v]', '-an', '-sn', '-dn', '-map_metadata', '-1',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', crf, '-pix_fmt', 'yuv420p', '-r', '24', '-g', '48', '-movflags', '+faststart', file]);
  run(['-ss', String(POSTER_AT - BLEND), '-i', file, '-frames:v', '1', '-q:v', '3', path.join(output, `xsom-studio-${variant}.jpg`)]);
}
const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
console.log(JSON.stringify({
  source: { file: path.basename(source), sha256: sha(source) },
  assets: fs.readdirSync(output).filter(f => f.startsWith('xsom-studio-')).map(file => ({ file, bytes: fs.statSync(path.join(output, file)).size })),
}, null, 2));
