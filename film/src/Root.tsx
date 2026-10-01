import { Fragment } from "react";
import { Composition } from "remotion";
import { FILMS, PageFilm, SHOT, STUDIO_SECONDS, StudioLoop, type FilmName } from "./films";

const FPS = 24;
/** Desktop 16:9 and phones 9:16; each shot's `focus` decides what the portrait crop keeps. */
const FORMATS = { desktop: { width: 1920, height: 1080 }, mobile: { width: 720, height: 1280 } } as const;

export function Root() {
  return (
    <>
      {Object.entries(FORMATS).map(([variant, size]) => (
        <Fragment key={variant}>
          {(Object.keys(FILMS) as FilmName[]).map((name) => (
            <Composition key={`${name}-${variant}`} id={`${name}-${variant}`} component={PageFilm} defaultProps={{ name }} durationInFrames={FILMS[name].length * SHOT * FPS} fps={FPS} {...size} />
          ))}
          <Composition id={`xsom-studio-${variant}`} component={StudioLoop} durationInFrames={STUDIO_SECONDS * FPS} fps={FPS} {...size} />
        </Fragment>
      ))}
    </>
  );
}
