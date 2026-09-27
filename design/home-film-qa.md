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
The compact play/pause symbols use the Lucide `Play` and `Pause` geometry (ISC);
their accessible French and English names remain in HTML attributes.

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

# Live titles and soundtrack — 2026-09-27

## Brief

The user asked for the homepage film to follow the AI Guard introduction film:
the same Discover, play and sound controls, and very short words over the film
closing on a large xSOM logo. Words, verbatim from the brief: “xSOM Consulting :
cabinet de conseil SI, cybersécurité et IA”, then “Gouvernance des systèmes
d’information, cybersécurité et infrastructures d’intelligence artificielle.
Depuis 2007, nous accompagnons les DSI de grands comptes sur leurs systèmes les
plus critiques — du cadrage stratégique jusqu’à la mise en production.” The
slogan “Le conseil qui tient jusqu’à la production” and similar stock phrases
stay removed. The user chose to keep the five xSOM shots and their own sound.

## Titles

One beat per shot; the shots cut at 6, 12, 18 and 24 seconds (verified by scene
detection and SSIM against the source clips): network → name and positioning;
cyber → governance, cybersecurity, AI infrastructure; production → “Depuis
2007” and the CIO introduction; AI infrastructure → “du cadrage stratégique” →
“jusqu’à la mise en production”; convergence → the three original arrows draw
in turn and weave as in `assets/logo/*.svg`, a light sweeps across them and the
name appears below. The loop closes on a short fade to night.

AI Guard burns its titles into the video. Here they are live HTML driven by the
film's current time (`assets/js/film-titles.js`, a pure function of time), because
this film fills 100svh and is cropped very differently at 390×844, 768×1024 and
1440×900: burned-in words would be cut. Live titles stay responsive, sharp and
translated, follow the film through stalls and pauses, and need no extra video
per language. The same words remain static HTML (`h1` and lead) for search
engines and screen readers; they are shown instead of the titles with reduced
motion, without JavaScript, after a media or autoplay failure, or when the film
has not started after three seconds.

## Sound

The five Grok clips carry quiet audio (−44 to −54 LUFS, low loudness range).
`tools/build-home-film.mjs` levels each six-second cut to −26 LUFS, limits peaks
to −2 dBFS, adds 0.12 s fades at the cuts, 0.4 s at the start and 0.8 s at the
end, and muxes the result (AAC 128 kb/s, stereo) into both exports. Result:
−26.4 LUFS integrated, each shot within 1.3 LU, true peak −1.9 dBFS. The film
starts muted on every visit; the sound button turns it on and resumes a paused
film. Desktop export: 8,875,732 bytes; mobile: 5,117,463 bytes. Posters unchanged.

## Acceptance

`node --test tests/*.test.cjs` checks the brief's wording, beat timing against
the shots, the Discover/play/sound bar and the audio stream. The browser check
(`tools/verify-home-film.cjs`) passes 16 FR/EN/theme/width layouts with every
title inside the viewport, below the navigation and above the bottom bar, sound
on/off and resume, and the five fallback states with the static copy visible.

# Offer section and header — 2026-09-27

The header follows AI Guard: brand left, menu centred, language and a quiet
outlined contact link right; tag line “Cabinet de conseil”; “Le cabinet” and
“Carrières” merged into “Cabinet & carrières” (active on both pages). On the
homepage it is clear over the film, turns solid navy once scrolled, tucks away
while reading down and returns on scroll up.

The offer section returns below the film with far less text: title only, the
original three-arrow map drawn live (arrows, then routes, then practice labels;
hovering a practice brightens its arrow), and three cards illustrated with shots
of the film (9 s, 21 s, 15 s → `assets/media/xsom-pole-{1,2,3}.jpg`), each with one
line and four keywords. Discover now glides to it; the page ends on the site
footer, so the legal links left the film bar. Reduced motion and no-JS show
everything at rest.

# Expertise film — 2026-09-27

The former expertise excerpt ran from 5 s to 23 s of the film and so opened on
one second of the network shot. It is replaced by an 18-second edit, one shot
per practice in the page's order: cyber (6–12 s of the film) for 01, AI
infrastructure (18–24 s) for 02, production (12–18 s) for 03, each with its own
clip's levelled sound (−26.4 LUFS). `tools/build-home-film.mjs` builds both
edits from the same source. Live titles use the page's own words: “0N / 03”,
the practice name and its three steps (e.g. Réseau · Contrôles · Résilience).
The hero's practice index fills a line under the practice on screen. The bar is
the homepage's (Discover → practice map, play, sound), generated by the page
renderer for both pages; titles and bar styles live in `assets/css/film-titles.css`.

# AI & sovereignty and careers films — 2026-09-27

Six Grok clips supplied by the user (6.04 s, 1904×1072, 24 fps, with sound):
`ia-{1,2,3}.mp4` and `carriere-{1,2,3}.mp4`. `tools/build-page-film.mjs` cuts
the first six seconds of each, levels each sound (−26.9 and −26.3 LUFS
integrated) and darkens only shots brighter than the site's footage: carrière 2
(eq gamma 0.869) and 3 (0.778), bringing their mean luma from 50–67 to 36–50.
Outputs: `xsom-sovereignty-*` and `xsom-careers-*`, 18 s, desktop and mobile.
The shared pipeline (`tools/film-edit.mjs`) rebuilds the homepage and expertise
films byte for byte. Beats reuse each page's own lines; the sovereignty beat
carries a French flag.
