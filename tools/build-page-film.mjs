#!/usr/bin/env node
// A page-top film from three generated clips: the first six seconds of each, in order,
// with its own levelled sound; shots brighter than the site's footage are brought down.
// Usage: node tools/build-page-film.mjs <name> clip-1.mp4 clip-2.mp4 clip-3.mp4
//   e.g. node tools/build-page-film.mjs xsom-sovereignty ~/Downloads/ia-{1,2,3}.mp4
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { output, buildEdit, matchLuma, withWorkDir } from './film-edit.mjs';

const [name, ...clips] = process.argv.slice(2);
if (!/^xsom-[a-z-]+$/.test(name || '') || !clips.length || !clips.every(clip => fs.existsSync(clip))) {
  throw new Error('Usage: node tools/build-page-film.mjs xsom-<page> clip-1.mp4 clip-2.mp4 clip-3.mp4');
}
const segments = clips.map(file => ({ file, start: 0, grade: matchLuma(file) }));
withWorkDir(work => buildEdit(name, segments, clips, work));
const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
console.log(JSON.stringify({
  clips: segments.map(({ file, grade }) => ({ file: path.basename(file), sha256: sha(file), grade: grade.replace(/,$/, '') || 'none' })),
  assets: fs.readdirSync(output).filter(f => f.startsWith(`${name}-`)).map(file => ({ file, bytes: fs.statSync(path.join(output, file)).size })),
}, null, 2));
