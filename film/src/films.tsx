import { AbsoluteFill, Audio, staticFile } from "remotion";
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

