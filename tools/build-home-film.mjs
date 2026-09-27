#!/usr/bin/env node
// Transcode the user-supplied edit locally, for the homepage and the expertise page, and lay
// the source clips' own sound under each shot. Never add graphics: the titles are live HTML
// over the film (index.html, expertises.html, assets/js/film-titles.js).
// Usage: node tools/build-home-film.mjs /path/to/approved-30s-edit.mp4 /path/to/source-clips/
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { SHOT, output, run, buildEdit, withWorkDir } from './film-edit.mjs';

const [source, clips] = process.argv.slice(2);
if (!source || !fs.existsSync(source) || !clips || !fs.existsSync(clips)) {
  throw new Error('Usage: node tools/build-home-film.mjs /path/to/approved-30s-edit.mp4 /path/to/source-clips/');
}
// The edit is these five Grok clips, each cut at its first six seconds, in this order.
const SHOTS = ['reseau1', 'cyber1', 'production2', 'infrastructure-ia1', 'convergence'].map(name => path.join(clips, `${name}.mp4`));
// Homepage: the whole film. Expertise page: one shot per practice, in the page's
// order: cyber (01 networks & cyber), AI infrastructure (02), production (03 data).
const EDITS = { 'xsom-film': [0, 1, 2, 3, 4], 'xsom-expertise': [1, 3, 2] };
withWorkDir(work => {
  for (const [name, shots] of Object.entries(EDITS)) {
    buildEdit(name, shots.map(shot => ({ file: source, start: shot * SHOT })), shots.map(shot => SHOTS[shot]), work);
  }
});
// The homepage offer cards reuse three shots of the film, one per practice.
for (const [name, at] of [['xsom-pole-1', 9], ['xsom-pole-2', 21], ['xsom-pole-3', 15]]) {
  run(['-ss', String(at), '-i', source, '-frames:v', '1', '-vf', 'scale=1280:720,setsar=1', '-q:v', '4', path.join(output, `${name}.jpg`)]);
}
const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
console.log(JSON.stringify({
  sourceSha256: sha(source),
  clips: SHOTS.map(file => ({ file: path.basename(file), sha256: sha(file) })),
  assets: fs.readdirSync(output).filter(f => /^xsom-(film|expertise|pole)-/.test(f)).map(file => ({ file, bytes: fs.statSync(path.join(output, file)).size })),
}, null, 2));
