import { useId, type CSSProperties } from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const clamp = (x: number) => Math.min(1, Math.max(0, x));

/** One stock clip on the film's timeline: `at` on the film, `from` in the clip, both in seconds. */
export type Shot = {
  clip: string;
  at: number;
  from: number;
  /** Horizontal focal point, 0 (left) to 1 (right): what a portrait crop keeps. */
  focus?: number;
  /** Brightness multiplier, for a shot darker or flatter than the others. */
  exposure?: number;
  /**
   * Midtone darkening (gamma exponent above 1), measured per shot so every shot sits near
   * the site's mean luma of about 40, as the former FFmpeg pipeline did: highlights and
   * blacks keep their place, the live titles keep their contrast.
   */
  gamma?: number;
  /** How far the slow push-in goes over the shot. */
  push?: number;
};

function Clip({ shot, frames, fade }: { shot: Shot; frames: number; fade: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = 1.015 + (shot.push ?? 0.05) * (frame / frames);
  const gamma = `gamma-${useId().replace(/[^\w-]/g, "")}`;
  return (
    <AbsoluteFill style={{ opacity: fade ? clamp(frame / fade) : 1 }}>
      {shot.gamma && (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id={gamma} colorInterpolationFilters="sRGB">
            <feComponentTransfer>
              <feFuncR type="gamma" exponent={shot.gamma} />
              <feFuncG type="gamma" exponent={shot.gamma} />
              <feFuncB type="gamma" exponent={shot.gamma} />
            </feComponentTransfer>
          </filter>
        </svg>
      )}
      <OffthreadVideo
        src={staticFile(`footage/${shot.clip}.mp4`)}
        trimBefore={Math.round(shot.from * fps)}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${(shot.focus ?? 0.5) * 100}% 50%`,
          transform: `scale(${scale})`,
          filter: `${shot.gamma ? `url(#${gamma}) ` : ""}brightness(${shot.exposure ?? 1}) contrast(1.06) saturate(0.8)`,
        }}
      />
    </AbsoluteFill>
  );
}

/**
 * The shots end to end. Each one dissolves in over `dissolve` seconds from its `at`, over the
 * previous shot, which keeps playing underneath until the dissolve is done.
 */
export function Reel({ shots, seconds, dissolve = 0.3, fadeFirst = false }: { shots: Shot[]; seconds: number; dissolve?: number; fadeFirst?: boolean }) {
  const { fps } = useVideoConfig();
  const fade = Math.round(dissolve * fps);
  return (
    <AbsoluteFill style={{ backgroundColor: fadeFirst ? undefined : "#050d1b" }}>
      {shots.map((shot, index) => {
        const from = Math.round(shot.at * fps);
        const until = Math.round((shots[index + 1]?.at ?? seconds) * fps) + (index < shots.length - 1 ? fade : 0);
        return (
          <Sequence key={`${shot.clip}-${shot.at}`} from={from} durationInFrames={until - from}>
            <Clip shot={shot} frames={until - from} fade={index || fadeFirst ? fade : 0} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

/**
 * The house grade over any footage: a cool navy tone, darker top and bottom edges for the
 * site's header and controls, a vignette and a fine moving grain, so clips from different
 * cameras read as one film.
 */
export function Grade({ grain = 0.05 }: { grain?: number }) {
  const frame = useCurrentFrame();
  const layer: CSSProperties = { position: "absolute", inset: 0 };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ ...layer, background: "#123a6e", mixBlendMode: "soft-light", opacity: 0.55 }} />
      <div style={{ ...layer, background: "#0c1c33", mixBlendMode: "color", opacity: 0.18 }} />
      <div
        style={{
          ...layer,
          background: "linear-gradient(180deg, rgba(4,12,26,.42), rgba(4,12,26,0) 28%, rgba(4,12,26,0) 72%, rgba(4,12,26,.5))",
        }}
      />
      <div style={{ ...layer, background: "radial-gradient(ellipse 75% 70% at 50% 50%, rgba(3,10,22,0) 55%, rgba(3,10,22,.55))" }} />
      <svg style={{ ...layer, width: "100%", height: "100%", opacity: grain, mixBlendMode: "overlay" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={Math.floor(frame / 2) % 97} stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
}
