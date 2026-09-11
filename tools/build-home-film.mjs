#!/usr/bin/env node
// Transcode the user-supplied edit locally. Never add graphics or an audio track.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2];
if (!source || !fs.existsSync(source)) throw new Error('Usage: node tools/build-home-film.mjs /path/to/approved-30s-edit.mp4');
const output = path.join(root, 'assets/media');
fs.mkdirSync(output, { recursive: true });
const run = args => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
const encode = (name, filter, crf) => {
  run(['-i', source, '-map', '0:v:0', '-an', '-sn', '-dn', '-map_metadata', '-1', '-t', '30',
    '-vf', filter, '-c:v', 'libx264', '-preset', 'slow', '-crf', crf,
    '-pix_fmt', 'yuv420p', '-r', '24', '-g', '48', '-movflags', '+faststart',
    path.join(output, `${name}.mp4`)]);
  run(['-i', path.join(output, `${name}.mp4`), '-frames:v', '1', '-q:v', '3', path.join(output, `${name}.jpg`)]);
};
encode('xsom-film-desktop', 'scale=1920:1080,setsar=1', '25');
// The actors sit around the right third. A right-biased crop retains them,
// unlike cropping flush to the far edge, which would retain only rack hardware.
encode('xsom-film-mobile', 'crop=ih*9/16:ih:(iw-ow)*0.78:0,scale=720:1280,setsar=1', '26');
console.log(JSON.stringify({ sourceSha256: createHash('sha256').update(fs.readFileSync(source)).digest('hex'), assets: fs.readdirSync(output).filter(f => f.startsWith('xsom-film-')).map(file => ({ file, bytes: fs.statSync(path.join(output, file)).size })) }, null, 2));
