// Shared film pipeline: six-second shots, each with its own clip's levelled sound, cut
// together and exported for desktop (16:9) and phones (9:16), with a first-frame poster.
// Used by build-home-film.mjs (homepage, expertise) and build-page-film.mjs (other pages).
// Each film carries its own background music (film-score.mjs), the clips' sound beneath.
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { score } from './film-score.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const output = path.join(root, 'assets/media');
export const SHOT = 6;
// Generated clips come very quiet (-44 to -59 LUFS). Each shot is brought to one level so
// cuts do not jump in volume; the limiter catches the few peaks the gain pushes over.
const LOUDNESS = -26;
// Music leads (user request, 2026-09-27: background music on every page-top film); the
// clips' own sound stays audible underneath, 8 LU lower.
const MUSIC = -21;
const UNDER = -3;
// The site's footage sits around this mean luma; brighter shots are brought down to it.
const TARGET_LUMA = 40;
export const DESKTOP = 'scale=1920:1080,setsar=1';
// Subjects sit around the right third. A right-biased crop retains them,
// unlike cropping flush to the far edge.
export const MOBILE = 'crop=ih*9/16:ih:(iw-ow)*0.78:0,scale=720:1280,setsar=1';

export const run = args => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
const stderr = args => spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...args], { encoding: 'utf8' }).stderr;
const loudness = (file, seconds = SHOT) => Number(stderr(['-i', file, '-t', String(seconds), '-vn', '-af', 'ebur128', '-f', 'null', '-']).match(/Integrated loudness:\s+I:\s+(-?[\d.]+) LUFS/)[1]);
const luma = (file, start) => {
  const values = [...stderr(['-ss', String(start), '-t', String(SHOT), '-i', file, '-vf', 'fps=2,signalstats,metadata=print:key=lavfi.signalstats.YAVG', '-f', 'null', '-']).matchAll(/YAVG=([\d.]+)/g)].map(m => Number(m[1]));
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

/** Only darkens: a shot already at or below the site's level is left as graded. */
export function matchLuma(file, start = 0) {
  const mean = luma(file, start);
  if (mean <= TARGET_LUMA + 2) return '';
  return `eq=gamma=${(Math.log(mean / 255) / Math.log(TARGET_LUMA / 255)).toFixed(3)},`;
}

export function withWorkDir(task) {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'xsom-film-'));
  try { return task(work); } finally { fs.rmSync(work, { recursive: true, force: true }); }
}

/** Levelled sound of each clip's first six seconds, one after another. */
export function soundtrack(clips, file) {
  const chains = clips.map((clip, index) => {
    const fadeIn = index === 0 ? 0.4 : 0.12;
    const fadeOut = index === clips.length - 1 ? 0.8 : 0.12;
    const gain = (LOUDNESS - loudness(clip)).toFixed(1);
    return `[${index}:a:0]atrim=0:${SHOT},asetpts=PTS-STARTPTS,aresample=48000,volume=${gain}dB,alimiter=limit=0.79:level=false,afade=t=in:d=${fadeIn},afade=t=out:st=${SHOT - fadeOut}:d=${fadeOut}[a${index}]`;
  });
  run([...clips.flatMap(clip => ['-i', clip]), '-filter_complex',
    `${chains.join(';')};${clips.map((_, index) => `[a${index}]`).join('')}concat=n=${clips.length}:v=0:a=1[out]`,
    '-map', '[out]', '-ac', '2', '-c:a', 'pcm_s16le', file]);
  return file;
}

/** segments: [{ file, start, grade }], cut to SHOT seconds each, framed by `filter`. */
export function encode(name, segments, audio, filter, crf) {
  const files = [...new Set(segments.map(segment => segment.file))];
  const cuts = segments.map(({ file, start, grade = '' }, index) =>
    `[${files.indexOf(file)}:v:0]trim=${start}:${start + SHOT},setpts=PTS-STARTPTS,${grade}${filter}[v${index}]`).join(';');
  const video = `${cuts};${segments.map((_, index) => `[v${index}]`).join('')}concat=n=${segments.length}:v=1:a=0[v]`;
  run([...files.flatMap(file => ['-i', file]), '-i', audio, '-filter_complex', video, '-map', '[v]', '-map', `${files.length}:a:0`,
    '-sn', '-dn', '-map_metadata', '-1', '-t', String(segments.length * SHOT), '-c:v', 'libx264', '-preset', 'slow', '-crf', crf,
    '-pix_fmt', 'yuv420p', '-r', '24', '-g', '48', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart',
    path.join(output, `${name}.mp4`)]);
  run(['-i', path.join(output, `${name}.mp4`), '-frames:v', '1', '-q:v', '3', path.join(output, `${name}.jpg`)]);
}

/** The film's music at its level, with the clips' levelled sound underneath. */
export function withMusic(name, sound, file) {
  const music = score(name, file.replace(/\.wav$/, '-music.wav'));
  const gain = (MUSIC - loudness(music, 600)).toFixed(1);
  run(['-i', music, '-i', sound, '-filter_complex',
    `[0:a]volume=${gain}dB[m];[1:a]volume=${UNDER}dB[s];[m][s]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.89:level=false[out]`,
    '-map', '[out]', '-ac', '2', '-ar', '48000', '-c:a', 'pcm_s16le', file]);
  return file;
}

/** Desktop and phone exports of one edit, sharing one soundtrack. */
export function buildEdit(name, segments, clips, work) {
  const audio = withMusic(name, soundtrack(clips, path.join(work, `${name}-clips.wav`)), path.join(work, `${name}.wav`));
  encode(`${name}-desktop`, segments, audio, DESKTOP, '25');
  encode(`${name}-mobile`, segments, audio, MOBILE, '26');
}
