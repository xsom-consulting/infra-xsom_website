// One projection for the homepage presence map: the land dots (build-presence-map.mjs)
// and the mission points (render-signal-pages.mjs) must land in the same place.
// Equirectangular, corrected for the window's middle latitude, from the Atlantic off
// Dakar to the Mozambique Channel and from Mayotte to the Channel.
export const WINDOW = { west: -20, east: 52, south: -16, north: 57 };
const scaleX = Math.cos(((WINDOW.north + WINDOW.south) / 2) * Math.PI / 180);
export const WIDTH = 1000;
const perDegree = WIDTH / ((WINDOW.east - WINDOW.west) * scaleX);
export const HEIGHT = Math.round((WINDOW.north - WINDOW.south) * perDegree);
export function project(lon, lat) {
  return [(lon - WINDOW.west) * scaleX * perDegree, (WINDOW.north - lat) * perDegree].map(v => Math.round(v * 10) / 10);
}
// Missions, largest first. Sizes follow the user's brief (2026-09-27), not counts.
export const MISSIONS = [
  { city: 'bordeaux', lon: -0.58, lat: 44.84, r: 16, side: 'left', fr: 'Bordeaux', en: 'Bordeaux' },
  { city: 'paris', lon: 2.35, lat: 48.86, r: 13, side: 'right', fr: 'Paris', en: 'Paris' },
  { city: 'toulouse', lon: 1.44, lat: 43.6, r: 9, side: 'right', fr: 'Toulouse', en: 'Toulouse' },
  { city: 'dakar', lon: -17.45, lat: 14.69, r: 7, side: 'right', fr: 'Dakar, Sénégal', en: 'Dakar, Senegal' },
  { city: 'mayotte', lon: 45.17, lat: -12.83, r: 7, side: 'left', fr: 'Mayotte', en: 'Mayotte' },
];
