import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { Grade, Reel, type Shot } from "./kit";

/** Six-second shots: the pages' live titles (assets/js/film-titles.js) are timed to them. */
export const SHOT = 6;

const shots = (...list: Omit<Shot, "at">[]): Shot[] => list.map((shot, index) => ({ ...shot, at: index * SHOT }));

/** Each page-top film, shot by shot, in the order of its titles. */
export const FILMS = {
  // Homepage: the brand over Paris (La Défense on the horizon), the three practices in a
  // supervision room, “since 2007” with a decision maker, strategy to production on the
  // servers, and the network under the closing logo.
  "xsom-film": shots(
    { clip: "13316516", from: 2, focus: 0.32, gamma: 1.7, exposure: 0.8, push: 0.04 },
    { clip: "7255101", from: 1, focus: 0.62, gamma: 1.1 },
    { clip: "8572188", from: 10, focus: 0.62, gamma: 1.65, exposure: 0.78 },
    { clip: "7140928", from: 1, focus: 0.5, exposure: 1.05, push: 0.07 },
    { clip: "35008786", from: 2, focus: 0.5, exposure: 0.85, push: 0.08 },
  ),
  // Expertise: one shot per practice, in the page's order.
  "xsom-expertise": shots(
    { clip: "1085656", from: 8, focus: 0.5, exposure: 0.9 },
    { clip: "7140928", from: 1.5, focus: 0.5, exposure: 1.05, push: 0.07 },
    { clip: "8348320", from: 2, focus: 0.36, gamma: 2, exposure: 0.66 },
  ),
  // AI & sovereignty: serenity (a calm look over the city at dusk), security, sovereignty
  // (the French flag).
  "xsom-sovereignty": shots(
    { clip: "4774976", from: 8, focus: 0.36, gamma: 1.4, exposure: 0.85 },
    { clip: "2887463", from: 2, focus: 0.4, gamma: 1.1 },
    { clip: "5903290", from: 3, focus: 0.45, gamma: 1.75, exposure: 0.83, push: 0.04 },
  ),
  // Careers: missions, decision makers, transmission.
  "xsom-careers": shots(
    { clip: "7692932", from: 1, focus: 0.62, gamma: 2.1, exposure: 0.65 },
    { clip: "8348314", from: 2, focus: 0.45, gamma: 1.45, exposure: 0.88 },
    { clip: "8004275", from: 3, focus: 0.62, gamma: 1.25 },
  ),
};
export type FilmName = keyof typeof FILMS;

/** A page-top film: its shots under the house grade, with its own music. */
export function PageFilm({ name }: { name: FilmName }) {
  const list = FILMS[name];
  return (
    <AbsoluteFill>
      <Reel shots={list} seconds={list.length * SHOT} />
      <Grade />
      <Audio src={staticFile(`score/${name}.wav`)} />
    </AbsoluteFill>
  );
}

/**
 * The AI page's xSOM AI Studio section plays the footage of guard.xsom.fr's opening film
 * (its Remotion project, films/src/HomeFilm.tsx), so the two sites read as one: the same
 * four clips, without titles. Silent, and seamless: over its last second the loop dissolves
 * into the second before its first frame.
 */
export const STUDIO_SECONDS = 14;
const STUDIO: Shot[] = [
  // Held still, so the dissolve at the end lands on exactly this framing.
  { clip: "6803584", at: 0, from: 9, focus: 0.55, exposure: 0.92, push: 0 },
  { clip: "34279721", at: 3.5, from: 0.4, focus: 0.4, exposure: 0.95, push: 0.08 },
  { clip: "1085656", at: 7, from: 4, focus: 0.5, exposure: 0.9 },
  { clip: "20670675", at: 10.5, from: 24, focus: 0.5, exposure: 0.95, push: 0.04 },
];

export function StudioLoop() {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Reel shots={STUDIO} seconds={STUDIO_SECONDS} />
      <Sequence from={(STUDIO_SECONDS - 1) * fps}>
        <Reel shots={[{ ...STUDIO[0], from: STUDIO[0].from - 1 }]} seconds={1} dissolve={1} fadeFirst />
      </Sequence>
      <Grade grain={0.04} />
    </AbsoluteFill>
  );
}
