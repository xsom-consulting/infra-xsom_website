#!/usr/bin/env node
// Build the dotted land mask of the homepage presence map, once, from Natural Earth
// land outlines (public domain) as packaged by world-atlas (ISC). The page then loads
// only this local SVG. Usage: node tools/build-presence-map.mjs /path/to/land-50m.json
// (https://cdn.jsdelivr.net/npm/world-atlas@2/land-50m.json).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WINDOW, WIDTH, HEIGHT, project } from './presence-projection.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2];
if (!source || !fs.existsSync(source)) throw new Error('Usage: node tools/build-presence-map.mjs /path/to/land-50m.json');
const topology = JSON.parse(fs.readFileSync(source, 'utf8'));
const STEP = 1; // degrees between dots

// Decode the quantised, delta-encoded TopoJSON arcs into lon/lat rings.
const { scale: [kx, ky], translate: [tx, ty] } = topology.transform;
const arcs = topology.arcs.map(arc => {
  let x = 0, y = 0;
  return arc.map(([dx, dy]) => { x += dx; y += dy; return [x * kx + tx, y * ky + ty]; });
});
const ring = indexes => indexes.flatMap((index, i) => {
  const points = index < 0 ? [...arcs[~index]].reverse() : arcs[index];
  return i ? points.slice(1) : points;
});
const polygons = topology.objects.land.geometries.flatMap(g => g.type === 'Polygon' ? [g.arcs] : g.arcs).map(rings => rings.map(ring));
const inside = (lon, lat, points) => {
  let hit = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i], [xj, yj] = points[j];
    if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
};
const land = (lon, lat) => polygons.some(([outer, ...holes]) => inside(lon, lat, outer) && !holes.some(hole => inside(lon, lat, hole)));

const dots = [];
for (let lat = WINDOW.north - STEP / 2; lat > WINDOW.south; lat -= STEP) {
  for (let lon = WINDOW.west + STEP / 2; lon < WINDOW.east; lon += STEP) {
    if (land(lon, lat)) dots.push(project(lon, lat));
  }
}
const d = dots.map(([x, y]) => `M${x} ${y}h0`).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}"><path d="${d}" fill="none" stroke="#000" stroke-width="5.5" stroke-linecap="round"/></svg>\n`;
fs.writeFileSync(path.join(root, 'assets/media/xsom-presence-land.svg'), svg);
console.log(JSON.stringify({ dots: dots.length, width: WIDTH, height: HEIGHT, bytes: svg.length }));
