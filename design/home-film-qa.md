# Homepage film — 2026-09-11

## Source and editorial decision

The user supplied `xsom-hero-desktop-30s.mp4` and five original Grok clips:
`reseau1.mp4`, `cyber1.mp4`, `production2.mp4`, `infrastructure-ia1.mp4`,
`convergence.mp4`, plus still-image references. The approved assembled film is
the source. Its SHA-256 is
`1a4d78a010b1371e2ee33df3fd1c5336d4e15ac55e94d542831851d9f17efc14`.
These are illustrative generated scenes, not actual xSOM/client premises or staff.

The five shots and their existing blue grade are retained. The cyber displays
remain a little more graphical than the other shots, as the user noted. They are
background imagery, not product screenshots. No title, caption, logo, subtitle,
audio or watermark is added by this pipeline. The film carries no audio stream.
The original stills were inspected; a frame from the approved edit is used as the
poster to match the first video frame without a jump in exposure or framing.

## Output

`tools/build-home-film.mjs` makes 30-second H.264 MP4s with fast-start metadata,
24 fps and yuv420p. Desktop: 1920×1080, 8,381,655 bytes. Mobile: 720×1280,
4,623,322 bytes, right-biased crop retaining the engineer rather than the far
edge of the racks. JPEG posters: 141,059 and 108,125 bytes. Media paths are
content-versioned by the static page generator. Originals remain in Downloads.

## First visual pass

Inspected French desktop 1440×900, French mobile 390×844 and English tablet
768×900, plus the live in-app browser at 1280×720. The image and typography have
clear hierarchy, the pale text remains legible over the navy scrim and the
original copy fits. The original three-arrow map is retained in the expertise
introduction. Both site themes leave the film and navigation deliberately dark.

Corrections: constrain desktop copy to the viewport's left 45%, place the pause
button above the content stacking layer, and place it just below the header on
phones so it is available without scrolling. Reduce the mobile minimum height.

## Acceptance

Run `tools/verify-home-film.cjs` against the preview. It verifies real playback,
16 FR/EN/theme/width combinations, keyboard pause/resume, preserved user pause,
offscreen pause, live reduced-motion changes, no download with OS/saved reduced
motion or JavaScript disabled, and visible posters after network or autoplay
failure. `tools/verify-hero-mark.cjs` verifies the relocated original logo and
all six real FR/EN expertise links. Original editorial contracts still apply.

## Final local result

The second visual pass confirms the mobile pause button is fully visible below
the navigation and the mobile title, lead, calls to action and evidence strip fit
the 390×844 viewport. Desktop text ends at the left 45% boundary. The expertise
mark remains legible beside its introduction and stacks cleanly on phones.

All 16 film layouts and the six playback/fallback scenarios pass, with no page
errors. All 16 original-mark layouts and six keyboard destinations pass. The
28 existing copy, runtime, brand and SEO contracts and partial synchronization
pass. A real in-app browser click pauses playback. Both exports have exactly one
video stream and no audio or subtitle stream. No actual contact form was sent.

The production check at 736×734 also inspected the brighter cyber shot. Its
screens required a stronger navy scrim across the tablet text column. The final
desktop/tablet scrim keeps at least 78% navy behind body copy, then clears toward
the right-hand subject. This change affects the HTML overlay, not the film grade.
