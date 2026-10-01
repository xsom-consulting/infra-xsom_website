// Renders the site's page-top films with Remotion, desktop (16:9) and phones (9:16), with
// their first-frame posters, the AI Studio loop and the homepage offer cards' stills, into
// assets/media/. Run `npm run footage` first. Optional arguments filter by film name:
//   npm run render -- xsom-film xsom-studio
// The music is tools/film-score.mjs, levelled here; the footage itself is silent.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { cues, score } from '../../tools/film-score.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(root, '../assets/media');
// The music's level, as plain RMS: about -21 LUFS on these cues, as before.
const TARGET_RMS_DB = -23;

const VARIANTS = { desktop: '25', mobile: '26' };
const STUDIO = { desktop: '27', mobile: '28' };
// The homepage offer cards: one still per practice, from the films (1280 × 720).
const POLES = [['xsom-pole-1', 'xsom-film-desktop', 9], ['xsom-pole-2', 'xsom-film-desktop', 21], ['xsom-pole-3', 'xsom-expertise-desktop', 15]];

/** Brings a float WAV from film-score.mjs to the target level, peaks under -1 dBFS. */
function level(file) {
  const wav = fs.readFileSync(file);
  const samples = new Float32Array(wav.buffer.slice(wav.byteOffset + 44, wav.byteOffset + wav.length));
  let power = 0, peak = 0;
  for (const sample of samples) { power += sample * sample; peak = Math.max(peak, Math.abs(sample)); }
  const gain = Math.min(0.89 / peak, 10 ** (TARGET_RMS_DB / 20) / Math.sqrt(power / samples.length));
  for (let i = 0; i < samples.length; i++) wav.writeFloatLE(samples[i] * gain, 44 + i * 4);
  fs.writeFileSync(file, wav);
}

const wanted = process.argv.slice(2);
const pick = name => !wanted.length || wanted.includes(name);
if (!fs.existsSync(path.join(root, 'public/footage'))) throw new Error('Run `npm run footage` first.');

fs.mkdirSync(path.join(root, 'public/score'), { recursive: true });
for (const name of Object.keys(cues).filter(pick)) level(score(name, path.join(root, 'public/score', `${name}.wav`)));

const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts') });
const render = async (id, file, crf, muted) => {
  const composition = await selectComposition({ serveUrl, id });
  await renderMedia({
    serveUrl, composition, outputLocation: path.join(output, `${file}.mp4`), codec: 'h264', crf: Number(crf), x264Preset: 'slow',
    pixelFormat: 'yuv420p', colorSpace: 'bt709', imageFormat: 'jpeg', jpegQuality: 92, audioCodec: 'aac', audioBitrate: '128k', muted,
  });
  return composition;
};
const still = async (id, file, seconds, scale = 1) => {
  const composition = await selectComposition({ serveUrl, id });
  await renderStill({ serveUrl, composition, frame: Math.round(seconds * composition.fps), output: path.join(output, `${file}.jpg`), imageFormat: 'jpeg', jpegQuality: 84, scale });
};

for (const name of Object.keys(cues).filter(pick)) {
  for (const [variant, crf] of Object.entries(VARIANTS)) {
    await render(`${name}-${variant}`, `${name}-${variant}`, crf, false);
    await still(`${name}-${variant}`, `${name}-${variant}`, 0);
  }
}
if (pick('xsom-studio')) {
  for (const [variant, crf] of Object.entries(STUDIO)) {
    await render(`xsom-studio-${variant}`, `xsom-studio-${variant}`, crf, true);
    // The business district under the dusk, the loop's closing image: the still for reduced motion.
    await still(`xsom-studio-${variant}`, `xsom-studio-${variant}`, 12);
  }
}
if (pick('xsom-film') || pick('xsom-expertise')) {
  for (const [file, id, seconds] of POLES) await still(id, file, seconds, 2 / 3);
}

const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 16);
const { clips } = JSON.parse(fs.readFileSync(path.join(root, 'footage.json'), 'utf8'));
console.log(JSON.stringify({
  footage: clips.map(({ id }) => ({ id, sha256: sha(path.join(root, 'public/footage', `${id}.mp4`)) })),
  assets: fs.readdirSync(output).filter(file => /^xsom-(film|expertise|sovereignty|careers|studio|pole)-/.test(file))
    .map(file => ({ file, bytes: fs.statSync(path.join(output, file)).size })),
}, null, 2));
